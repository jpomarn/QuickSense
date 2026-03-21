#Importing 

from flask import Flask, render_template, request, redirect, session, jsonify
import sqlite3

app = Flask(__name__)
app.secret_key = "secret123"

# -------------------------
# DATABASE SETUP

def init_db():
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    # USERS TABLE
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        username TEXT NOT NULL,
        password TEXT NOT NULL
    )
    """)

    # RESULTS TABLE
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        test_type TEXT,
        result TEXT,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()

init_db()

# -------------------------
# ROUTES


@app.route("/")
def home():
    return render_template("index.html", user=session.get("user"))

# SIGNUP
@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        name = request.form["name"]
        username = request.form["username"]
        password = request.form["password"]

        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()

        cursor.execute(
            "INSERT INTO users (name, username, password) VALUES (?, ?, ?)",
            (name, username, password)
        )

        conn.commit()
        conn.close()

        return redirect("/login")

    return render_template("signup.html")

# LOGIN
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()

        cursor.execute(
            "SELECT * FROM users WHERE username=? AND password=?",
            (username, password)
        )

        user = cursor.fetchone()
        conn.close()

        if user:
            session["user"] = username
            session["name"] = user[1]
            return redirect("/dashboard")
        else:
            return "Invalid credentials ❌"

    return render_template("login.html")

# DASHBOARD
@app.route("/dashboard")
def dashboard():
    if "user" not in session:
        return redirect("/login")

    return render_template("dashboard.html", name=session.get("name"))

# HEARING PAGE
@app.route("/hearing")
def hearing():
    if "user" not in session:
        return redirect("/login")

    return render_template("hearing.html")

# VISION PAGE
@app.route("/vision")
def vision():
    if "user" not in session:
        return redirect("/login")

    return render_template("vision.html")

# SAVE HEARING RESULT
@app.route("/save_results", methods=["POST"])
def save_results():
    data = request.get_json()
    result = data["result"]
    username = session.get("user")

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO results (username, test_type, result) VALUES (?, ?, ?)",
        (username, "hearing", result)
    )

    conn.commit()
    conn.close()

    session["result"] = result
    return jsonify({"status": "success"})

# SAVE VISION RESULT
@app.route("/save_vision_result", methods=["POST"])
def save_vision_result():
    data = request.get_json()
    result = data["result"]
    username = session.get("user")

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO results (username, test_type, result) VALUES (?, ?, ?)",
        (username, "vision", result)
    )

    conn.commit()
    conn.close()

    session["vision_result"] = result
    return jsonify({"status": "success"})

# RESULTS PAGES
@app.route("/results")
def results():
    if "user" not in session:
        return redirect("/login")

    result = session.get("result", "No results found.")
    return render_template("results.html", result=result)

@app.route("/vision_results")
def vision_results():
    if "user" not in session:
        return redirect("/login")

    result = session.get("vision_result", "No results found.")
    return render_template("vision_results.html", result=result)

# HISTORY PAGE
@app.route("/history")
def history():
    if "user" not in session:
        return redirect("/login")

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute(
        "SELECT test_type, result, date FROM results WHERE username=? ORDER BY date DESC",
        (session["user"],)
    )

    data = cursor.fetchall()
    conn.close()

    return render_template("history.html", data=data)

# LOGOUT
@app.route("/logout")
def logout():
    session.pop("user", None)
    session.pop("name", None)
    return redirect("/")

# -------------------------
# RUN APP
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)