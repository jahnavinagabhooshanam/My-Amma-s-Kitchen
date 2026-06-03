from app import app
from database.db import db
from sqlalchemy import text

try:
    with app.app_context():
        # Using raw SQL to add the column, wrapped in a try block in case it already exists
        db.session.execute(text("ALTER TABLE products ADD COLUMN diet_type VARCHAR(50) DEFAULT 'Veg' NOT NULL"))
        db.session.commit()
        print("Successfully added diet_type to products table")
except Exception as e:
    print(f"Error or column already exists: {e}")
