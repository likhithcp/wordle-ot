from app import db, Word, User, generate_password_hash
from app import app
with app.app_context():
    db.drop_all()
    db.create_all()
    # create 20 sample words (uppercase)
    words = ["AUDIO","HOMER","JOKER","TONER","TOWER","APPLE","GRAPE","PLANT","SHIFT","BRAVE",
             "CRANE","DRIVE","EPOCH","FAITH","GHOST","HONEY","INNER","JUDGE","KNOCK","LIGHT"]
    for w in words:
        db.session.add(Word(text=w))
    # admin user
    from werkzeug.security import generate_password_hash
    admin = User(username="AdminUser", password_hash=generate_password_hash("Admin1$"), is_admin=True)
    db.session.add(admin)
    db.session.commit()
    print("Initialized DB with sample words and admin user. Username=AdminUser password=Admin1$")