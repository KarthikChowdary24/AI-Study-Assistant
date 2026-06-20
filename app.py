from flask import Flask, render_template, request, jsonify
from groq import Groq
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

# Load environment variables
load_dotenv()

# Flask app
app = Flask(__name__)

# Database configuration
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///chats.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# Database model
class Chat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_message = db.Column(db.Text, nullable=False)
    bot_response = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Groq client
client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

# Home page
@app.route("/")
def home():
    return render_template("index.html")

# Chat endpoint
@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        user_message = data["message"]

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
    {
        "role": "system",
        "content": """
    You are an AI Study Assistant for engineering students.

    Rules:
        - Explain concepts clearly.
        - Use simple language first, then technical details.
        - For exam questions, provide structured answers.
        - Use headings and bullet points.
        - Generate detailed notes when requested.
        - Generate MCQs with answers when requested.
        - Generate important 8-mark and 16-mark questions.
        - Create study plans.
        - Include examples wherever possible.
        - Help students prepare for semester examinations.
        """
    },
                {
                    "role": "user",
                    "content": user_message
                }
            ]
        )

        reply = response.choices[0].message.content

        # Save chat to database
        chat_record = Chat(
            user_message=user_message,
            bot_response=reply
        )

        db.session.add(chat_record)
        db.session.commit()

        return jsonify({
            "response": reply
        })

    except Exception as e:
        print("ERROR:", str(e))

        return jsonify({
            "response": f"ERROR: {str(e)}"
        })

# Get chat history
@app.route("/history")
def history():

    chats = Chat.query.order_by(
        Chat.created_at.desc()
    ).all()

    history_data = []

    for chat in chats:
        history_data.append({
            "id": chat.id,
            "user": chat.user_message,
            "bot": chat.bot_response,
            "time": chat.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })

    return jsonify(history_data)

@app.route("/chat/<int:chat_id>")
def get_chat(chat_id):

    chat = Chat.query.get(chat_id)

    if not chat:
        return jsonify({
            "error": "Chat not found"
        }), 404

    return jsonify({
        "user": chat.user_message,
        "bot": chat.bot_response
    })

# Run application
if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(debug=True)