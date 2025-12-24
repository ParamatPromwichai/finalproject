from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    jwt_required,
    set_refresh_cookies
)
from flask_cors import CORS
from datetime import timedelta
import psycopg2
import os
from dotenv import load_dotenv

# =====================
# Load env
# =====================
load_dotenv()

# =====================
# App setup
# =====================
app = Flask(__name__)
CORS(app, supports_credentials=True)

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_TOKEN_LOCATION"] = ["headers", "cookies"]
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=15)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=7)

bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# =====================
# Database connection
# =====================
def get_db():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

# =====================
# REGISTER
# =====================
@app.post("/api/register")
def register():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"msg": "Missing username or password"}), 400

    # 🔐 hash password (สำคัญมาก)
    password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    conn = get_db()
    cur = conn.cursor()

    try:
        cur.execute(
            "INSERT INTO users (username, password_hash) VALUES (%s, %s)",
            (username, password_hash)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"msg": "Username already exists"}), 400
    finally:
        cur.close()
        conn.close()

    return jsonify({"msg": "Register success"}), 201

# =====================
# LOGIN
# =====================
@app.post("/api/login")
def login():
    data = request.get_json()
    username =     password = data.get("password")

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, password_hash FROM users WHERE username=%s",
        (username,)
    )
    user = cur.fetchone()
    cur.close()
    conn.close()

    print("USERNAME:", username)
    print("PASSWORD INPUT:", password)
    print("HASH FROM DB:", user[1] if user else None)

    if not user:
        return jsonify({"msg": "User not found"}), 401

    result = bcrypt.check_password_hash(user[1], password)
    print("CHECK RESULT:", result)

    if not result:
        return jsonify({"msg": "Password incorrect"}), 401

    access_token = create_access_token(identity=user[0])
    return jsonify({"access_token": access_token})

# =====================
# PROTECTED TEST
# =====================
@app.get("/api/dashboard")
@jwt_required()
def dashboard():
    return jsonify({"msg": "Welcome to Restaurant Admin Dashboard"})

# =====================
# Run
# =====================
if __name__ == "__main__":
    app.run(debug=True)
