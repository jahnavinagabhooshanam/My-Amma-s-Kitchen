import os
from app import app
from database.db import db
from database.models import User, Order, OrderItem, BulkOrder, Review, WebsiteActivity, Notification, CartItem

def remove_demo_transactions():
    with app.app_context():
        print("Ensuring all tables exist...")
        db.create_all()
        print("Removing demo transaction data...")
        
        # Delete related to orders
        OrderItem.query.delete()
        Notification.query.delete()
        Order.query.delete()
        
        # Delete other transactions
        BulkOrder.query.delete()
        Review.query.delete()
        WebsiteActivity.query.delete()
        CartItem.query.delete()

        # Delete customers but keep admin/manager/staff
        User.query.filter(User.role == 'customer').delete()

        db.session.commit()
        print("Demo transaction data removed successfully!")

if __name__ == '__main__':
    remove_demo_transactions()
