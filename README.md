Word Guess Game
================

Overview
--------
A lightweight Flask application where users guess a five-letter word within five attempts. The app supports user registration, daily game limits, and administrative reporting.

Requirements
------------
- Python 3.9+
- Pip

Optional (recommended): a dedicated virtual environment.

Installation
------------
1. Create and activate a virtual environment (optional but recommended).
2. Install dependencies:
   pip install -r requirements.txt

Database Initialization
-----------------------
Run once to create and seed the SQLite database:
   python init_db.py

Running the Application
-----------------------
Start the development server:
   python app.py

By default the app uses a local SQLite database file (wordgame.db).

Default Administrative Account
------------------------------
- Username: AdminUser
- Password: Admin1$

Features
--------
- User registration and authentication.
- Daily game limit: up to 3 new games per calendar day.
- Per-game limit: up to 5 guesses to identify the target word.
- Result persistence in SQLite (guesses and games).
- Administrative reports: daily stats and per-user summaries.

Validation Rules
----------------
- Username: at least 5 characters, must include both uppercase and lowercase letters.
- Password: at least 5 characters, must include alphabetic and numeric characters and one of the following: $ % * @.

Notes
-----
- This project is intended for local development and demonstration purposes. For production, configure a proper WSGI server, environment variables, and secure secret management.