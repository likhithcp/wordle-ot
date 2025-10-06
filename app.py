
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, date
import random, re, os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///wordgame.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get("WG_SECRET","replace_this_with_a_secret")

# Configure static files
app.static_folder = 'static'

db = SQLAlchemy(app)

# ----- Models -----
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

class Word(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(5), unique=True, nullable=False)  # stored uppercase

class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    word_id = db.Column(db.Integer, db.ForeignKey('word.id'), nullable=False)
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    finished = db.Column(db.Boolean, default=False)
    won = db.Column(db.Boolean, default=False)
    guesses = db.relationship('Guess', backref='game', lazy=True)

class Guess(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('game.id'), nullable=False)
    guess_text = db.Column(db.String(5), nullable=False)  # uppercase
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# ----- Helpers -----
USERNAME_RE = re.compile(r'^(?=.*[a-z])(?=.*[A-Z]).{5,}$')
PASSWORD_RE = re.compile(r'^(?=.*[A-Za-z])(?=.*\d)(?=.*[$%*@]).{5,}$')

def validate_username(u):
    return USERNAME_RE.match(u) is not None

def validate_password(p):
    return PASSWORD_RE.match(p) is not None

def current_user():
    uid = session.get('user_id')
    if not uid:
        return None
    return User.query.get(uid)

# ----- Routes -----
@app.route('/')
def index():
    user = current_user()
    return render_template('landing.html', user=user)

@app.route('/register', methods=['GET','POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if not validate_username(username):
            flash('Username must be at least 5 characters and include both upper and lower case letters.')
            return redirect(url_for('register'))
        if not validate_password(password):
            flash('Password must be at least 5 chars and include alpha, numeric and one of $ % * @')
            return redirect(url_for('register'))
        if User.query.filter_by(username=username).first():
            flash('Username already exists.')
            return redirect(url_for('register'))
        h = generate_password_hash(password)
        u = User(username=username, password_hash=h, is_admin=False)
        db.session.add(u)
        db.session.commit()
        # Auto-login after registration
        session['user_id'] = u.id
        # Immediately start a first game and redirect to play page
        words = Word.query.all()
        if words:
            word = random.choice(words)
            g = Game(user_id=u.id, word_id=word.id)
            db.session.add(g)
            db.session.commit()
            flash('Registration successful! Your first game has started. Good luck!', 'info')
            return redirect(url_for('play', game_id=g.id))
        else:
            flash('Registration successful! (No words available yet, please contact admin).')
            return redirect(url_for('index'))
    return render_template('auth.html', form_type='register')

@app.route('/login', methods=['GET','POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        u = User.query.filter_by(username=username).first()
        print(f'User: {u}')
        if not u or not check_password_hash(u.password_hash, password):
            print(f'Invalid credentials: {username} {password}')
            flash('Invalid credentials.')
            return redirect(url_for('login'))
        print(f'Logged in: {u}')
        session['user_id'] = u.id
        flash('Logged in.')
        return redirect(url_for('index'))
    return render_template('auth.html', form_type='login')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    flash('Logged out.')
    return redirect(url_for('index'))

# start a new game (picks a random word). enforce max 3 games started per calendar day
@app.route('/start_game', methods=['POST'])
def start_game():
    user = current_user()
    if not user:
        flash('Please login first.')
        return redirect(url_for('login'))
    # Count games started today (midnight to now)
    start_of_today = datetime.combine(date.today(), datetime.min.time())
    games_today = Game.query.filter(
        Game.user_id==user.id,
        Game.started_at>=start_of_today
    ).count()
    print(f'Games started today: {games_today}')
    if games_today >= 3:
        flash('Daily limit reached: You have already started 3 games today. Please try again tomorrow.', 'quota')
        return redirect(url_for('index'))
    # pick random word
    words = Word.query.all()
    if not words:
        flash('No words in DB.')
        return redirect(url_for('index'))
    word = random.choice(words)
    g = Game(user_id=user.id, word_id=word.id)
    db.session.add(g)
    db.session.commit()
    return redirect(url_for('play', game_id=g.id))

@app.route('/play/<int:game_id>', methods=['GET','POST'])
def play(game_id):
    user = current_user()
    if not user:
        flash('Please login.')
        return redirect(url_for('login'))
    game = Game.query.get_or_404(game_id)
    if game.user_id != user.id and not user.is_admin:
        flash('Not your game.')
        return redirect(url_for('index'))
    target = Word.query.get(game.word_id).text
    guesses = [g.guess_text for g in game.guesses]
    message = None
    if request.method == 'POST':
        if game.finished:
            flash('Game already finished.')
            return redirect(url_for('play', game_id=game_id))
        guess = request.form['guess'].strip().upper()
        if len(guess) != 5 or not guess.isalpha():
            flash('Enter a 5-letter word, letters only.')
            return redirect(url_for('play', game_id=game_id))
        if len(game.guesses) >= 5:
            flash('Max 5 guesses reached for this game.')
            return redirect(url_for('play', game_id=game_id))
        g = Guess(game_id=game.id, guess_text=guess)
        db.session.add(g)
        db.session.commit()
        # check win
        if guess == target:
            game.finished = True
            game.won = True
            db.session.commit()
            flash('You won! Great job guessing the word!', 'win')
            return redirect(url_for('index'))
        else:
            if len(game.guesses) >= 5:
                game.finished = True
                game.won = False
                db.session.commit()
                flash('Better luck next time. The word was: ' + target, 'loss')
                return redirect(url_for('index'))
        return redirect(url_for('play', game_id=game_id))
    # prepare display tiles colors for each guess
    display = []
    for g in game.guesses:
        row = []
        guess = g.guess_text
        target_chars = list(target)
        color = ['grey']*5
        # First pass for greens
        for i,ch in enumerate(guess):
            if target[i]==ch:
                color[i]='green'
                target_chars[i]=None
        # Second pass for oranges
        for i,ch in enumerate(guess):
            if color[i]=='grey' and ch in target_chars:
                color[i]='orange'
                target_chars[target_chars.index(ch)]=None
        for i,ch in enumerate(guess):
            row.append({'ch': ch, 'color': color[i]})
        display.append(row)
    return render_template('play.html', game=game, display=display, guesses=len(game.guesses))

# admin reports
from sqlalchemy import func
@app.route('/admin/reports', methods=['GET','POST'])
def admin_reports():
    user = current_user()
    if not user or not user.is_admin:
        flash('Admins only.')
        return redirect(url_for('index'))
    day_report = None
    user_report = None
    if request.method == 'POST':
        if 'report_day' in request.form:
            ds = request.form['date']
            d = datetime.strptime(ds, '%Y-%m-%d').date()
            start = datetime.combine(d, datetime.min.time())
            end = datetime.combine(d, datetime.max.time())
            # number of distinct users who started games that day
            num_users = db.session.query(func.count(func.distinct(Game.user_id))).filter(Game.started_at>=start, Game.started_at<=end).scalar()
            # number of correct guesses (games won) started that day or finished that day? We'll count games finished and won on that day
            correct = db.session.query(func.count(Game.id)).filter(Game.won==True, Game.started_at>=start, Game.started_at<=end).scalar()
            day_report = {'date': ds, 'num_users': int(num_users or 0), 'correct_guesses': int(correct or 0)}
        elif 'report_user' in request.form:
            uname = request.form['username']
            u = User.query.filter_by(username=uname).first()
            if not u:
                flash('User not found.')
            else:
                # for each date, number of words tried and number of correct guesses
                from sqlalchemy import case
                rows = db.session.query(
                    func.date(Game.started_at),
                    func.count(Game.id),
                    func.sum(case((Game.won==True, 1), else_=0))
                ).filter(Game.user_id==u.id).group_by(func.date(Game.started_at)).all()
                user_report = {'username': uname, 'rows': [{'date':str(r[0]), 'words_tried':int(r[1]), 'correct': int(r[2] or 0)} for r in rows]}
    return render_template('admin_dashboard.html', day_report=day_report, user_report=user_report)

# Admin management routes
@app.route('/admin/make_admin', methods=['POST'])
def make_admin():
    user = current_user()
    if not user or not user.is_admin:
        return jsonify({'error': 'Admin access required'}), 403
    
    data = request.get_json()
    username = data.get('username')
    action = data.get('action')  # 'make' or 'remove'
    
    if not username:
        return jsonify({'error': 'Username required'}), 400
    
    target_user = User.query.filter_by(username=username).first()
    if not target_user:
        return jsonify({'error': 'User not found'}), 404
    
    if action == 'make':
        target_user.is_admin = True
        message = f'{username} is now an admin'
    elif action == 'remove':
        target_user.is_admin = False
        message = f'{username} is no longer an admin'
    else:
        return jsonify({'error': 'Invalid action'}), 400
    
    db.session.commit()
    return jsonify({'success': True, 'message': message})

@app.route('/admin/users')
def admin_users():
    user = current_user()
    if not user or not user.is_admin:
        return jsonify({'error': 'Admin access required'}), 403
    
    users = User.query.all()
    users_data = []
    for u in users:
        # Get game statistics for each user
        games_played = Game.query.filter_by(user_id=u.id).count()
        wins = Game.query.filter_by(user_id=u.id, won=True).count()
        
        users_data.append({
            'username': u.username,
            'is_admin': u.is_admin,
            'games_played': games_played,
            'wins': wins
        })
    
    return jsonify(users_data)

# simple API to fetch remaining games allowed today
@app.route('/api/remaining_today')
def api_remaining():
    user = current_user()
    if not user:
        return jsonify({'error':'not logged in'}), 401
    today = date.today()
    games_today = Game.query.filter(Game.user_id==user.id, Game.started_at>=datetime.combine(today, datetime.min.time())).count()
    return jsonify({'remaining': max(0, 3-games_today)})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
