# pyright: reportCallIssue=false
# type: ignore

import random
from datetime import datetime, timedelta
from app import app
from database.db import db
from database.models import User, Product, BatterProduct, Inventory, Coupon, Review, Order, OrderItem, BulkOrder, BatterProduction, DeliveryPartner, WebsiteActivity, KitchenStaff
from werkzeug.security import generate_password_hash

def seed_database():
    with app.app_context():
        print("Clearing existing database tables...")
        # Clear tables in dependency order
        OrderItem.query.delete()
        Order.query.delete()
        BulkOrder.query.delete()
        Review.query.delete()
        Coupon.query.delete()
        Inventory.query.delete()
        BatterProduct.query.delete()
        Product.query.delete()
        User.query.delete()
        BatterProduction.query.delete()
        DeliveryPartner.query.delete()
        WebsiteActivity.query.delete()
        KitchenStaff.query.delete()
        
        print("Seeding users...")
        # Seed test admin account
        admin = User(
            name="Amma Admin",
            email="admin@ammaskitchen.com",
            phone="+91 99999 99999",
            password_hash=generate_password_hash("Admin@123"),
            role="admin",
            status="Active",
            profile_completed=True
        )
        # Seed test manager account
        manager = User(
            name="Suresh Kumar",
            email="manager@ammaskitchen.com",
            phone="+91 98840 98765",
            password_hash=generate_password_hash("Manager@123"),
            role="manager",
            status="Active",
            profile_completed=True
        )
        # Seed test kitchen staff
        kitchen = User(
            name="Ramanathan Iyer",
            email="kitchen@ammaskitchen.com",
            phone="+91 98840 55555",
            password_hash=generate_password_hash("Kitchen@123"),
            role="kitchen_staff",
            status="Active",
            profile_completed=True
        )
        # Seed test delivery staff
        delivery = User(
            name="Karthik S.",
            email="delivery@ammaskitchen.com",
            phone="+91 98840 12345",
            password_hash=generate_password_hash("Delivery@123"),
            role="delivery_staff",
            status="Active",
            profile_completed=True
        )
        # Seed test customer account
        customer = User(
            name="Jane Doe",
            email="customer@test.com",
            phone="+91 98765 43210",
            password_hash=generate_password_hash("Customer@123"),
            role="customer",
            status="Active",
            profile_completed=True
        )
        db.session.add(admin)
        db.session.add(manager)
        db.session.add(kitchen)
        db.session.add(delivery)
        db.session.add(customer)
        
        print("Seeding products...")
        # Seed default products
        products_list = [
            Product(
                id=1,
                name="Artisan Idli & Dosa Batter",
                category="batter_products",
                description="Stone-ground parboiled rice and urad dal batter, perfectly fermented for fluffy idlis and crispy dosas. 100% natural, no preservatives.",
                price=60.00,
                offer_price=50.00,
                image="/assets/Food images/Batters/Dosa Batter.webp",
                stock=50,
                is_available=True
            ),
            Product(
                id=2,
                name="Artisan Ragi (Finger Millet) Batter",
                category="batter_products",
                description="Healthy finger millet blended with ground urad dal. Rich in calcium and iron, perfect for high-nutrient breakfast dosas.",
                price=75.00,
                offer_price=65.00,
                image="/assets/Food images/Batters/Idli Batter.webp",
                stock=30,
                is_available=True
            ),
            Product(
                id=3,
                name="Crispy Medu Vada Batter",
                category="batter_products",
                description="Specially ground premium black gram batter with a touch of peppercorn, curry leaves, and ginger. Ready to shape and deep fry.",
                price=90.00,
                offer_price=80.00,
                image="/assets/Food images/Batters/Urid Vada Batter.webp",
                stock=20,
                is_available=True
            ),
            Product(
                id=4,
                name="Signature Idli Platter",
                category="ready_to_eat",
                description="Four steaming hot, pillow-soft idlis served with Amma's signature tomato-onion chutney, coconut chutney, and piping hot sambar.",
                price=100.00,
                offer_price=90.00,
                image="/assets/Food images/Veg/Edli Sambar.webp",
                stock=100,
                is_available=True
            ),
            Product(
                id=5,
                name="Amma's Special Ghee Podi Dosa",
                category="ready_to_eat",
                description="Large, golden crispy crepe smeared with aromatic spiced lentil powder (podi) and pure home-refined cow ghee. Served with chutneys and sambar.",
                price=120.00,
                offer_price=110.00,
                image="/assets/Food images/Veg/Ghee Roast Dosa.webp",
                stock=100,
                is_available=True
            ),
            Product(
                id=6,
                name="Malabar Parotta with Veg Kurma",
                category="ready_to_eat",
                description="Two flaky, multi-layered hand-stretched parottas served with a flavorful rich coconut gravy packed with garden fresh vegetables.",
                price=140.00,
                offer_price=130.00,
                image="/assets/Food images/Veg/Veg Meals.webp",
                stock=40,
                is_available=True
            ),
            Product(
                id=7,
                name="Premium Chapati (Half-Cooked Pack)",
                category="ready_to_cook",
                description="100% whole wheat chapatis, lightly toasted on a tawa. Just heat for 30 seconds on each side and serve hot. Preservative free.",
                price=80.00,
                offer_price=70.00,
                image="/assets/Food images/Veg/Poori Dhal.webp",
                stock=60,
                is_available=True
            ),
            Product(
                id=8,
                name="Poori & Aloo Masala (Ready-to-Fry Pack)",
                category="ready_to_cook",
                description="Freshly rolled poori discs ready for deep frying, bundled with a vacuum-packed delicious potato onion masala curry.",
                price=110.00,
                offer_price=95.00,
                image="/assets/Food images/Veg/Poori Dhal.webp",
                stock=25,
                is_available=True
            )
        ]
        for p in products_list:
            db.session.add(p)
            
        print("Seeding batter_products variants...")
        # Seed variants in batter_products table
        batters_list = [
            BatterProduct(
                id=1,
                product_name="Artisan Idli & Dosa Batter",
                variant="Standard Pouch",
                weight="1kg",
                price=60.00,
                offer_price=50.00,
                stock=50,
                expiry_date=(datetime.utcnow() + timedelta(days=4)).strftime("%Y-%m-%d"),
                manufacture_date=datetime.utcnow().strftime("%Y-%m-%d"),
                image="/assets/Food images/Batters/Dosa Batter.webp"
            ),
            BatterProduct(
                id=2,
                product_name="Artisan Ragi (Finger Millet) Batter",
                variant="Nutri Pack",
                weight="1kg",
                price=75.00,
                offer_price=65.00,
                stock=30,
                expiry_date=(datetime.utcnow() + timedelta(days=1)).strftime("%Y-%m-%d"), # near expiry
                manufacture_date=(datetime.utcnow() - timedelta(days=2)).strftime("%Y-%m-%d"),
                image="/assets/Food images/Batters/Idli Batter.webp"
            ),
            BatterProduct(
                id=3,
                product_name="Crispy Medu Vada Batter",
                variant="Standard Cup",
                weight="500g",
                price=90.00,
                offer_price=80.00,
                stock=0, # expired warning mock
                expiry_date=(datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d"),
                manufacture_date=(datetime.utcnow() - timedelta(days=5)).strftime("%Y-%m-%d"),
                image="/assets/Food images/Batters/Urid Vada Batter.webp"
            )
        ]
        for b in batters_list:
            db.session.add(b)
 
        print("Seeding upgraded raw material inventory items...")
        # Raw materials tracking: Rice, Urad Dal, Millet, Oil, Packaging Materials
        inventory_items = [
            Inventory(item_name="Rice", stock_quantity=500, unit="kg", minimum_stock=100, stock_used=80),
            Inventory(item_name="Urad Dal", stock_quantity=200, unit="kg", minimum_stock=50, stock_used=35),
            Inventory(item_name="Millet", stock_quantity=150, unit="kg", minimum_stock=30, stock_used=20),
            Inventory(item_name="Oil", stock_quantity=100, unit="Litre", minimum_stock=20, stock_used=15),
            Inventory(item_name="Packaging Materials", stock_quantity=1000, unit="Pcs", minimum_stock=200, stock_used=150),
        ]
        for inv in inventory_items:
            db.session.add(inv)
            
        print("Seeding coupons...")
        coupons = [
            Coupon(coupon_code="AMMA20", discount_type="percentage", discount_value=20.0, expiry_date="2027-12-31", is_active=True, usage_count=145),
            Coupon(coupon_code="WELCOME10", discount_type="percentage", discount_value=10.0, expiry_date="2027-12-31", is_active=True, usage_count=87),
            Coupon(coupon_code="FESTIVAL100", discount_type="flat", discount_value=100.0, expiry_date="2026-06-30", is_active=True, usage_count=23)
        ]
        for cp in coupons:
            db.session.add(cp)

        print("Seeding batter production history logs...")
        today = datetime.utcnow()
        production_records = [
            BatterProduction(batter_type="Artisan Idli & Dosa Batter", produced_quantity=120.0, sold_quantity=85.0, remaining_quantity=35.0, unit="kg", date=today - timedelta(days=2)),
            BatterProduction(batter_type="Artisan Ragi (Finger Millet) Batter", produced_quantity=80.0, sold_quantity=60.0, remaining_quantity=20.0, unit="kg", date=today - timedelta(days=2)),
            BatterProduction(batter_type="Artisan Idli & Dosa Batter", produced_quantity=150.0, sold_quantity=110.0, remaining_quantity=40.0, unit="kg", date=today - timedelta(days=1)),
            BatterProduction(batter_type="Artisan Ragi (Finger Millet) Batter", produced_quantity=90.0, sold_quantity=70.0, remaining_quantity=20.0, unit="kg", date=today - timedelta(days=1)),
            BatterProduction(batter_type="Crispy Medu Vada Batter", produced_quantity=60.0, sold_quantity=50.0, remaining_quantity=10.0, unit="kg", date=today - timedelta(days=1)),
            BatterProduction(batter_type="Artisan Idli & Dosa Batter", produced_quantity=180.0, sold_quantity=0.0, remaining_quantity=180.0, unit="kg", date=today),
        ]
        for pr in production_records:
            db.session.add(pr)

        print("Seeding delivery partners...")
        delivery_partners = [
            DeliveryPartner(name="Karthik S.", phone="+91 98840 12345", status="Available", assigned_orders=""),
            DeliveryPartner(name="Subramani K.", phone="+91 97740 54321", status="Assigned", assigned_orders="ORD-3, ORD-5"),
            DeliveryPartner(name="Ranjith Kumar", phone="+91 96640 98765", status="Out For Delivery", assigned_orders="ORD-1"),
            DeliveryPartner(name="Selvam P.", phone="+91 95540 11223", status="Available", assigned_orders="")
        ]
        for dp in delivery_partners:
            db.session.add(dp)

        print("Seeding product reviews...")
        reviews_list = [
            Review(user_id=2, product_id=1, rating=5, review="Perfect fermentation! The idlis turned out so soft and fluffy.", status="Approved", is_featured=True, created_at=today - timedelta(days=4)),
            Review(user_id=2, product_id=2, rating=4, review="Very healthy option. My kids loved the Ragi dosas.", status="Approved", is_featured=False, created_at=today - timedelta(days=3)),
            Review(user_id=2, product_id=3, rating=5, review="Crispy vada batter was awesome, ready to fry out of the box.", status="Pending", is_featured=False, created_at=today - timedelta(days=1)),
            Review(user_id=2, product_id=4, rating=5, review="Sambar was mouthwatering, absolute Mylapore authentic style!", status="Approved", is_featured=True, created_at=today)
        ]
        for rv in reviews_list:
            db.session.add(rv)

        # Seed historical orders for sales trends analytics (past 30 days)
        print("Seeding historical orders for sales charts...")
        for day_offset in range(30):
            order_date = today - timedelta(days=day_offset)
            # Create 1-4 orders per day
            for o_idx in range(random.randint(1, 4)):
                amount = float(random.randint(120, 680))
                # Delivered for older days, active status for recent ones
                if day_offset > 2:
                    status = "Delivered"
                else:
                    status = random.choice(["Pending", "Confirmed", "Preparing", "Out For Delivery", "Delivered"])
                
                o = Order(
                    user_id=2,
                    total_amount=amount,
                    status=status,
                    payment_status="Paid" if status == "Delivered" else "Pending",
                    delivery_address="No. 12, Sannidhi Street, Mylapore, Chennai",
                    created_at=order_date
                )
                db.session.add(o)

        print("Saving orders...")
        db.session.commit()

        # Retrieve orders to link items
        orders = Order.query.all()
        print(f"Linking {len(orders)} orders with item details...")
        for o in orders:
            # 1-3 items per order
            for _ in range(random.randint(1, 3)):
                prod = random.choice(products_list)
                qty = random.randint(1, 3)
                price = prod.price
                item = OrderItem(
                    order_id=o.id,
                    product_id=prod.id,
                    quantity=qty,
                    price=price
                )
                db.session.add(item)
        
        print("Seeding Bulk Catering Inquiries...")
        bulk_inquiries = [
            BulkOrder(customer_name="Dr. Rajesh G.", mobile="+91 94440 98765", email="rajesh@clinical-research.in", event_type="Wedding", event_date=(today + timedelta(days=10)).strftime("%Y-%m-%d"), guest_count=350, location="Mylapore Sangeetha Mandapam", food_package="Premium South Indian Dinner Buffet", special_request="Live Masala Dosa counter and Ragi Batter counter setup requested.", status="Submitted"),
            BulkOrder(customer_name="Sanjay Sen", mobile="+91 91234 56789", email="sanjay@sen-consulting.com", event_type="Corporate", event_date=(today + timedelta(days=5)).strftime("%Y-%m-%d"), guest_count=80, location="Tidel Park Sen Conference Hall", food_package="Executive Lunch Box combo", special_request="Ready-to-eat Parotta packages and Medu Vada included.", status="Approved", assigned_partner_id=2),
            BulkOrder(customer_name="Meenakshi Sundaram", mobile="+91 99887 76655", email="meenakshi@templetrust.org", event_type="Temple", event_date=(today + timedelta(days=15)).strftime("%Y-%m-%d"), guest_count=600, location="Kapaleeshwarar Sannidhi Hall", food_package="Traditional Sattvik Prasad Platter", special_request="Pure vegetarian food, no onion or garlic in recipes.", status="Approved"),
            BulkOrder(customer_name="Preethi Nair", mobile="+91 98401 54321", email="preethi@birthday-planners.com", event_type="Birthday", event_date=(today + timedelta(days=3)).strftime("%Y-%m-%d"), guest_count=45, location="Greenways Road Villa", food_package="Kids Special Mini Idli & Podi Dosa", special_request="Assorted desserts and kids friendly sweet vadas.", status="Rejected")
        ]
        for bk in bulk_inquiries:
            db.session.add(bk)

        print("Seeding live website activity traffic logs...")
        activity_logs = [
            WebsiteActivity(ip_address="192.168.1.50", activity_type="page_view", timestamp=datetime.utcnow() - timedelta(minutes=1)),
            WebsiteActivity(ip_address="192.168.1.51", activity_type="page_view", timestamp=datetime.utcnow() - timedelta(minutes=2)),
            WebsiteActivity(ip_address="192.168.1.52", activity_type="page_view", timestamp=datetime.utcnow() - timedelta(minutes=3)),
            WebsiteActivity(ip_address="192.168.1.53", activity_type="page_view", timestamp=datetime.utcnow() - timedelta(minutes=4)),
            WebsiteActivity(ip_address="192.168.1.54", activity_type="page_view", timestamp=datetime.utcnow() - timedelta(minutes=8)),
            
            WebsiteActivity(ip_address="192.168.1.50", activity_type="product_view", product_id=1, timestamp=datetime.utcnow() - timedelta(minutes=1)),
            WebsiteActivity(ip_address="192.168.1.51", activity_type="product_view", product_id=1, timestamp=datetime.utcnow() - timedelta(minutes=2)),
            WebsiteActivity(ip_address="192.168.1.52", activity_type="product_view", product_id=2, timestamp=datetime.utcnow() - timedelta(minutes=3)),
            WebsiteActivity(ip_address="192.168.1.53", activity_type="product_view", product_id=1, timestamp=datetime.utcnow() - timedelta(minutes=4)),
            WebsiteActivity(ip_address="192.168.1.50", activity_type="product_view", product_id=4, timestamp=datetime.utcnow() - timedelta(minutes=5)),
            
            WebsiteActivity(ip_address="192.168.1.50", activity_type="add_to_cart", product_id=1, timestamp=datetime.utcnow() - timedelta(minutes=1)),
            WebsiteActivity(ip_address="192.168.1.52", activity_type="add_to_cart", product_id=2, timestamp=datetime.utcnow() - timedelta(minutes=3)),
            
            WebsiteActivity(ip_address="192.168.1.53", activity_type="order_placed", timestamp=datetime.utcnow() - timedelta(minutes=4)),
            WebsiteActivity(ip_address="192.168.1.51", activity_type="customer_registered", timestamp=datetime.utcnow() - timedelta(minutes=2))
        ]
        for act in activity_logs:
            db.session.add(act)

        print("Seeding active kitchen staff members...")
        kitchen_members = [
            KitchenStaff(name="Ramanathan Iyer", phone="+91 98840 55555", specialty="South Indian Batter Chef", status="Available", assigned_tasks="Prepare Dosa Batter Batch"),
            KitchenStaff(name="Chef Gopinath", phone="+91 98401 22222", specialty="Dosa Master", status="Cooking", assigned_tasks="Cook ORD-12"),
            KitchenStaff(name="Meenakshi Sundaram", phone="+91 98401 33333", specialty="Prep Cook & Curries", status="On Break", assigned_tasks="None")
        ]
        for km in kitchen_members:
            db.session.add(km)

        db.session.commit()
        print("Seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
