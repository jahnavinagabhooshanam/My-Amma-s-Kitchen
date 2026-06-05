import os
from app import app
from database.db import db
from database.models import User, Product, BatterProduct, Order, OrderItem, CartItem, BulkOrder, Review, Coupon, Inventory, BatterProduction, DeliveryPartner, WebsiteActivity, KitchenStaff, HomepageConfig

def reset_database():
    with app.app_context():
        print("Dropping all existing tables in MySQL database...")
        db.drop_all()
        print("Creating all tables from current database models...")
        db.create_all()
        print("All database tables recreated successfully!")

if __name__ == '__main__':
    reset_database()
