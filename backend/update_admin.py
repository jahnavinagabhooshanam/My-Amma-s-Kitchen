from app import app
from database.db import db
from database.models import User
from werkzeug.security import generate_password_hash

with app.app_context():
    # Remove the old admin
    old_admin = User.query.filter_by(email='admin@ammaskitchen.com').first()
    if old_admin:
        db.session.delete(old_admin)
        db.session.commit()
        print('Deleted old admin.')

    # Update or create the new admin
    new_admin = User.query.filter_by(email='ammuluskitchen57@gmail.com').first()
    if new_admin:
        new_admin.password_hash = generate_password_hash('Ammulus@7255')
        new_admin.role = 'admin'
        db.session.commit()
        print('Updated new admin password.')
    else:
        admin = User(
            name='Admin User',
            email='ammuluskitchen57@gmail.com',
            phone='9876543210',
            password_hash=generate_password_hash('Ammulus@7255'),
            role='admin',
            status='Active',
            profile_completed=True
        )
        db.session.add(admin)
        db.session.commit()
        print('Created new admin.')

