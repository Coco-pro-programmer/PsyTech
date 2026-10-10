from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import os
import secrets
import hashlib
from datetime import datetime, timedelta
from dotenv import load_dotenv
load_dotenv()

from models import (
    db,
    User,
    Mood,
    Journal,
    Module,
    WellnessResource,
    ChatMessage,
    UserPreference,
    
)

from ai_service import generate_ai_response


app = Flask(__name__)


# ============================================================
# CONFIGURATION
# ============================================================

app.config["SECRET_KEY"] = os.getenv(
    "SECRET_KEY",
    "psytech-development-secret-key"
)

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://redacted:redacted@localhost/psytech"
)


CORS(
    app,
    supports_credentials=True,
    origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],
)


db.init_app(app)


# ============================================================
# PASSWORD RESET TOKEN (DEMO MODE)
# ============================================================

class PasswordResetToken(db.Model):
    __tablename__ = "password_reset_tokens"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )
    token_hash = db.Column(db.String(64), unique=True, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False, nullable=False)

# ============================================================
# HELPERS
# ============================================================

def get_logged_in_user():
    """
    Return the currently authenticated user.
    """

    user_id = session.get("user_id")

    if not user_id:
        return None

    return db.session.get(User, user_id)


def authentication_required():
    """
    Return authenticated user or None.
    """

    return get_logged_in_user()


def user_to_dict(user):
    """
    Return only safe user information.
    """

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
    }


# ============================================================
# BASIC ROUTES
# ============================================================


@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if not name or not email or not password:
        return jsonify({
            "success": False,
            "message": "Name, email and password are required."
        }), 400

    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return jsonify({
            "success": False,
            "message": "An account with this email already exists."
        }), 409

    hashed_password = generate_password_hash(password)

    user = User(
        name=name,
        email=email,
        password=hashed_password
    )

    try:
        db.session.add(user)
        db.session.commit()

        # Create a login session for the newly registered user
        session.clear()
        session["user_id"] = user.id

        return jsonify({
            "success": True,
            "message": "Registration successful.",
            "user": user_to_dict(user)
        }), 201

    except Exception as error:
        db.session.rollback()
        print("Registration error:", error)

        return jsonify({
            "success": False,
            "message": "Registration failed. Please try again."
        }), 500


@app.route("/api/login", methods=["POST"])
def login():

    data = request.get_json(silent=True) or {}

    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if not email or not password:

        return jsonify({
            "success": False,
            "message": "Email and password are required."
        }), 400

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(
        user.password,
        password
    ):

        return jsonify({
            "success": False,
            "message": "Invalid email or password."
        }), 401

    session.clear()
    session["user_id"] = user.id

    return jsonify({
        "success": True,
        "message": "Login successful.",
        "user": user_to_dict(user)
    })


@app.route("/api/me", methods=["GET"])
def current_user():

    user = get_logged_in_user()

    if not user:

        return jsonify({
            "success": False,
            "message": "Authentication required."
        }), 401

    return jsonify({
        "success": True,
        "user": user_to_dict(user)
    })


@app.route("/api/logout", methods=["POST"])
def logout():

    session.clear()

    return jsonify({
        "success": True,
        "message": "Logged out successfully."
    })


# ============================================================
# PASSWORD RESET (LOCAL DEMO MODE)
# ============================================================

@app.route("/api/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()

    if not email:
        return jsonify({
            "success": False,
            "message": "Email is required."
        }), 400

    user = User.query.filter_by(email=email).first()

    # Keep the response generic for unknown email addresses.
    if not user:
        return jsonify({
            "success": True,
            "message": "If the account exists, reset instructions are ready."
        })

    try:
        # Invalidate earlier unused tokens for this account.
        PasswordResetToken.query.filter_by(
            user_id=user.id,
            used=False
        ).delete()

        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(
            raw_token.encode("utf-8")
        ).hexdigest()

        reset_token = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=datetime.utcnow() + timedelta(minutes=15),
            used=False
        )

        db.session.add(reset_token)
        db.session.commit()

        frontend_url = os.getenv(
            "FRONTEND_URL",
            "http://localhost:3000"
        ).rstrip("/")

        reset_url = (
            f"{frontend_url}/reset-password?token={raw_token}"
        )

        return jsonify({
            "success": True,
            "message": "Demo reset link created. It expires in 15 minutes.",
            "reset_url": reset_url
        })

    except Exception as error:
        db.session.rollback()
        print("Forgot password error:", error)

        return jsonify({
            "success": False,
            "message": "Could not create a reset link."
        }), 500


@app.route("/api/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json(silent=True) or {}

    raw_token = str(data.get("token", "")).strip()
    new_password = str(data.get("password", ""))

    if not raw_token or not new_password:
        return jsonify({
            "success": False,
            "message": "Token and new password are required."
        }), 400

    if len(new_password) < 8:
        return jsonify({
            "success": False,
            "message": "Password must be at least 8 characters long."
        }), 400

    token_hash = hashlib.sha256(
        raw_token.encode("utf-8")
    ).hexdigest()

    try:
        reset_token = PasswordResetToken.query.filter_by(
            token_hash=token_hash,
            used=False
        ).first()

        if (
            not reset_token
            or reset_token.expires_at < datetime.utcnow()
        ):
            return jsonify({
                "success": False,
                "message": "This reset link is invalid or has expired. Please request a new one."
            }), 400

        user = db.session.get(User, reset_token.user_id)

        if not user:
            return jsonify({
                "success": False,
                "message": "This reset link is invalid or has expired."
            }), 400

        user.password = generate_password_hash(new_password)
        reset_token.used = True

        # Invalidate any other unused reset tokens for this user.
        PasswordResetToken.query.filter(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.id != reset_token.id,
            PasswordResetToken.used == False
        ).update({"used": True})

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Password reset successfully. You can now log in."
        })

    except Exception as error:
        db.session.rollback()
        print("Reset password error:", error)

        return jsonify({
            "success": False,
            "message": "Could not reset your password."
        }), 500

# ============================================================
# PROFILE
# ============================================================

@app.route("/api/profile", methods=["GET"])
def get_profile():

    user = authentication_required()

    if not user:

        return jsonify({
            "success": False,
            "message": "Authentication required."
        }), 401

    return jsonify({
        "success": True,
        "user": user_to_dict(user)
    })


@app.route("/api/profile", methods=["PUT"])
def update_profile():

    user = authentication_required()

    if not user:

        return jsonify({
            "success": False,
            "message": "Authentication required."
        }), 401

    data = request.get_json(silent=True) or {}

    name = str(data.get("name", "")).strip()

    if not name:

        return jsonify({
            "success": False,
            "message": "Name cannot be empty."
        }), 400

    if len(name) > 100:

        return jsonify({
            "success": False,
            "message": "Name is too long."
        }), 400

    user.name = name

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Profile updated successfully.",
        "user": user_to_dict(user)
    })


# ============================================================
# USER PREFERENCES
# ============================================================

PREFERENCE_OPTIONS = [
    "Calm & relaxation",
    "Stress & emotions",
    "Focus & study",
    "Grounding",
    "Self-reflection",
    "Sleep & rest",
    "Confidence & relationships"
]


@app.route("/api/preferences", methods=["GET"])
def get_preferences():
    user = authentication_required()

    if not user:
        return jsonify({
            "success": False,
            "message": "Authentication required."
        }), 401

    preferences = UserPreference.query.filter_by(
        user_id=user.id
    ).all()

    return jsonify({
        "success": True,
        "preferences": [p.interest for p in preferences],
        "options": PREFERENCE_OPTIONS
    })


@app.route("/api/preferences", methods=["PUT"])
def save_preferences():
    user = authentication_required()

    if not user:
        return jsonify({
            "success": False,
            "message": "Authentication required."
        }), 401

    data = request.get_json(silent=True) or {}
    interests = data.get("interests", data.get("preferences", []))

    if not isinstance(interests, list):
        return jsonify({
            "success": False,
            "message": "Interests must be a list."
        }), 400

    if not all(isinstance(i, str) for i in interests):
        return jsonify({
            "success": False,
            "message": "Invalid interests."
        }), 400

    interests = list(dict.fromkeys(i.strip() for i in interests))

    if any(i not in PREFERENCE_OPTIONS for i in interests):
        return jsonify({
            "success": False,
            "message": "Invalid preference selected."
        }), 400

    try:
        UserPreference.query.filter_by(
            user_id=user.id
        ).delete()

        for interest in interests:
            db.session.add(UserPreference(
                user_id=user.id,
                interest=interest
            ))

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Preferences saved successfully.",
            "preferences": interests
        })

    except Exception as error:
        db.session.rollback()
        print("Preferences error:", error)

        return jsonify({
            "success": False,
            "message": "Could not save preferences."
        }), 500


# ============================================================
# MOOD CHECK-IN
# ============================================================

@app.route("/api/moods", methods=["POST"])
def create_mood():

    user = authentication_required()

    if not user:

        return jsonify({
            "success": False,
            "message": "Authentication required."
        }), 401

    data = request.get_json(silent=True) or {}

    mood_value = data.get("mood")
    note = str(data.get("note", "")).strip()

    if mood_value is None:

        return jsonify({
            "success": False,
            "message": "Mood is required."
        }), 400

    mood = Mood(
        user_id=user.id,
        mood=str(mood_value),
        note=note
    )

    db.session.add(mood)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Mood saved successfully."
    }), 201


@app.route("/api/moods", methods=["GET"])
def get_moods():

    user = authentication_required()

    if not user:

        return jsonify({
            "success": False,
            "message": "Authentication required."
        }), 401

    moods = (
        Mood.query
        .filter_by(user_id=user.id)
        .order_by(Mood.created_at.desc())
        .all()
    )

    return jsonify({
        "success": True,
        "moods": [
            {
                "id": mood.id,
                "mood": mood.mood,
                "note": mood.note or "",
                "created_at": (
                    mood.created_at.isoformat()
                    if mood.created_at
                    else None
                )
            }
            for mood in moods
        ]
    })


# ============================================================
# JOURNAL
# ============================================================

@app.route("/api/journals", methods=["GET"])
def get_journals():

    user = authentication_required()

    if not user:

        return jsonify({
            "success": False,
            "message": "Authentication required."
        }), 401

    journals = (
        Journal.query
        .filter_by(user_id=user.id)
        .order_by(Journal.created_at.desc())
        .all()
    )

    return jsonify({
        "success": True,
        "journals": [
            {
                "id": journal.id,
                "title": journal.title,
                "content": journal.content,
                "created_at": (
                    journal.created_at.isoformat()
                    if journal.created_at
                    else None
                ),
                "updated_at": (
                    journal.updated_at.isoformat()
                    if journal.updated_at
                    else None
                )
            }
            for journal in journals
        ]
    })


@app.route("/api/journals", methods=["POST"])
def create_journal():

    user = authentication_required()

    if not user:

        return jsonify({
            "success": False,
            "message": "Authentication required."
        }), 401

    data = request.get_json(silent=True) or {}

    title = str(data.get("title", "")).strip()
    content = str(data.get("content", "")).strip()

    if not content:

        return jsonify({
            "success": False,
            "message": "Journal content is required."
        }), 400

    journal = Journal(
        user_id=user.id,
        title=title,
        content=content
    )

    db.session.add(journal)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Journal entry saved successfully.",
        "journal": {
            "id": journal.id,
            "title": journal.title,
            "content": journal.content,
            "created_at": (
                journal.created_at.isoformat()
                if journal.created_at
                else None
            )
        }
    }), 201


# ============================================================
# WELLNESS HUB
# ============================================================

@app.route("/api/modules", methods=["GET"])
def get_modules():

    modules = (
        Module.query
        .filter_by(is_active=True)
        .order_by(Module.created_at.desc())
        .all()
    )

    return jsonify({
        "success": True,
        "modules": [
            {
                "id": module.id,
                "title": module.title,
                "description": module.description,
                "category": module.category,
                "content": module.content,
                "is_active": module.is_active,
                "created_at": (
                    module.created_at.isoformat()
                    if module.created_at
                    else None
                )
            }
            for module in modules
        ]
    })


@app.route("/api/wellness-resources", methods=["GET"])
def get_wellness_resources():

    resources = (
        WellnessResource.query
        .filter_by(is_active=True)
        .order_by(WellnessResource.created_at.desc())
        .all()
    )

    return jsonify({
        "success": True,
        "resources": [
            {
                "id": resource.id,
                "title": resource.title,
                "category": resource.category,
                "resource_type": resource.resource_type,
                "description": resource.description,
                "content": resource.content,
                "url": resource.url,
                "is_active": resource.is_active,
                "created_at": (
                    resource.created_at.isoformat()
                    if resource.created_at
                    else None
                )
            }
            for resource in resources
        ]
    })

# ============================================================
# AI COMPANION — OPENROUTER
# ============================================================

@app.route("/api/chat", methods=["POST"])
def chat():

    user = authentication_required()

    if not user:

        return jsonify({
            "success": False,
            "message": "Authentication required."
        }), 401

    data = request.get_json(silent=True) or {}

    message = str(data.get("message", "")).strip()
    conversation = data.get("conversation", [])

    if not message:

        return jsonify({
            "success": False,
            "message": "Message cannot be empty."
        }), 400

    if not isinstance(conversation, list):
        conversation = []

    try:

        response_text = generate_ai_response(
            user_message=message,
            conversation_history=conversation
        )

        # Save user message
        user_chat_message = ChatMessage(
            user_id=user.id,
            sender="user",
            message=message
        )

        db.session.add(user_chat_message)

        # Save AI response
        assistant_chat_message = ChatMessage(
            user_id=user.id,
            sender="assistant",
            message=response_text
        )

        db.session.add(assistant_chat_message)

        db.session.commit()

        return jsonify({
            "success": True,
            "response": response_text
        })

    except RuntimeError as error:

        db.session.rollback()

        print(f"AI Companion error: {error}")

        return jsonify({
            "success": False,
            "message": str(error)
        }), 502

    except Exception as error:

        db.session.rollback()

        print(f"Unexpected AI Companion error: {error}")

        return jsonify({
            "success": False,
            "message": "The AI Companion could not respond right now."
        }), 500


# ============================================================
# AI COMPANION CHAT HISTORY
# ============================================================

@app.route("/api/chat/history", methods=["GET"])
def get_chat_history():

    user = authentication_required()

    if not user:

        return jsonify({
            "success": False,
            "message": "Authentication required."
        }), 401

    messages = (
        ChatMessage.query
        .filter_by(user_id=user.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    return jsonify({
        "success": True,
        "messages": [
            {
                "id": message.id,
                "sender": message.sender,
                "message": message.message,
                "created_at": (
                    message.created_at.isoformat()
                    if message.created_at
                    else None
                )
            }
            for message in messages
        ]
    })


# ============================================================
# APPLICATION START
# ============================================================

if __name__ == "__main__":

    with app.app_context():
        db.create_all()

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )