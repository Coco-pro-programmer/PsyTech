import os
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))


OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


PSYTECH_SYSTEM_PROMPT = """
You are PsyTech AI Companion, a supportive wellbeing and self-reflection
assistant inside the PsyTech web application.

PsyTech is a student-oriented mental wellbeing platform. Your purpose is to
help users reflect on their feelings, organize thoughts, learn general
wellbeing techniques, and discover practical self-help activities.

IMPORTANT BOUNDARIES:
- You are not a therapist, psychologist, psychiatrist, or doctor.
- Do not diagnose mental health conditions.
- Do not claim certainty about a user's mental health.
- Do not prescribe medication or medical treatment.
- Do not replace professional mental health support.
- Do not encourage harmful or dangerous behavior.
- When a situation appears serious or beyond general wellbeing support,
  encourage the user to speak with a trusted person or qualified professional.
- Keep responses calm, respectful, non-judgmental, and age-appropriate.
- Do not make the user dependent on the AI.
- Encourage healthy real-world support and connections when appropriate.

RESPONSE STYLE:
- Be warm but professional.
- Keep normal responses concise and useful.
- Give practical suggestions rather than long lectures.
- Ask a simple follow-up question when it would genuinely help.
- Use short paragraphs or bullet points when useful.
- Do not repeatedly mention these boundaries unless relevant.
- Never pretend to know personal information that the user has not provided.

PSYTECH FEATURES YOU MAY RECOMMEND:
- Mood Check-in
- Mood History
- Journal
- Wellness Hub
- Wellness Studio
- Professional Help

If a user asks about PsyTech itself, explain that PsyTech is a wellbeing
and self-reflection platform and that its AI Companion is one component of it.
"""


def generate_ai_response(user_message, conversation_history=None):
    """
    Send the user's message to OpenRouter and return the AI response.

    The OpenRouter API key is read from the backend environment:
        OPENROUTER_API_KEY

    The frontend never receives or handles this API key.
    """

    api_key = os.getenv("OPENROUTER_API_KEY")

    if not api_key:
        raise RuntimeError(
            "OPENROUTER_API_KEY is not configured on the backend."
        )

    if not user_message or not user_message.strip():
        raise ValueError("Message cannot be empty.")

    messages = [
        {
            "role": "system",
            "content": PSYTECH_SYSTEM_PROMPT,
        }
    ]

    # Keep only recent conversation messages so requests do not grow
    # unnecessarily large.
    if conversation_history:
        for message in conversation_history[-10:]:
            if not isinstance(message, dict):
                continue

            role = message.get("role")
            content = message.get("content")

            if role in ("user", "assistant") and content:
                messages.append(
                    {
                        "role": role,
                        "content": str(content),
                    }
                )

    messages.append(
        {
            "role": "user",
            "content": user_message.strip(),
        }
    )

    payload = {
        "model": "openrouter/free",
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 500,
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "PsyTech AI Companion",
    }

    try:
        response = requests.post(
            OPENROUTER_URL,
            headers=headers,
            json=payload,
            timeout=60,
        )

    except requests.RequestException as error:
        raise RuntimeError(
            "Unable to connect to the AI service."
        ) from error

    if response.status_code != 200:
        try:
            error_data = response.json()
        except ValueError:
            error_data = {}

        error_message = (
            error_data.get("error", {}).get("message")
            if isinstance(error_data.get("error"), dict)
            else None
        )

        raise RuntimeError(
            error_message
            or f"OpenRouter request failed with status {response.status_code}."
        )

    try:
        data = response.json()
        choices = data.get("choices", [])

        if not choices:
            raise RuntimeError("The AI service returned no response.")

        message = choices[0].get("message", {})
        content = message.get("content")

        if not content:
            raise RuntimeError("The AI service returned an empty response.")

        return content.strip()

    except (ValueError, TypeError, AttributeError) as error:
        raise RuntimeError(
            "The AI service returned an invalid response."
        ) from error