from datetime import datetime
from database.db import db

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    phone = db.Column(db.String(50), nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default='customer', nullable=False, index=True)  # 'customer', 'admin', 'manager', 'kitchen_staff', 'delivery_staff'
    status = db.Column(db.String(50), default='Active', nullable=False, index=True)  # 'Active', 'Disabled'
    permissions = db.Column(db.Text, nullable=True)
    profile_image = db.Column(db.String(255), nullable=True)
    is_verified = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # New profile completion fields
    profile_completed = db.Column(db.Boolean, default=False, nullable=False)
    door_number = db.Column(db.String(255), nullable=True)
    street_name = db.Column(db.String(255), nullable=True)
    area = db.Column(db.String(255), nullable=True)
    city = db.Column(db.String(255), nullable=True)
    state = db.Column(db.String(255), nullable=True)
    pincode = db.Column(db.String(20), nullable=True)
    landmark = db.Column(db.String(255), nullable=True)
    alternate_mobile = db.Column(db.String(50), nullable=True)
    preference = db.Column(db.String(50), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "role": self.role,
            "status": self.status,
            "permissions": self.permissions,
            "profile_image": self.profile_image,
            "is_verified": self.is_verified,
            "profile_completed": self.profile_completed,
            "door_number": self.door_number,
            "street_name": self.street_name,
            "area": self.area,
            "city": self.city,
            "state": self.state,
            "pincode": self.pincode,
            "landmark": self.landmark,
            "alternate_mobile": self.alternate_mobile,
            "preference": self.preference,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False, index=True)
    category = db.Column(db.String(100), nullable=False, index=True)  # 'ready_to_eat', 'ready_to_cook', 'batter_products'
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    offer_price = db.Column(db.Float, nullable=True)
    image = db.Column(db.String(255), nullable=True)
    stock = db.Column(db.Integer, default=0, nullable=False)
    is_available = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "description": self.description,
            "price": self.price,
            "offer_price": self.offer_price,
            "image": self.image,
            "stock": self.stock,
            "is_available": self.is_available,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class BatterProduct(db.Model):
    __tablename__ = 'batter_products'
    
    id = db.Column(db.Integer, primary_key=True)
    product_name = db.Column(db.String(255), nullable=False)
    variant = db.Column(db.String(100), nullable=True)  # e.g., '1kg Pouch', '500g Container'
    weight = db.Column(db.String(50), nullable=True)
    price = db.Column(db.Float, nullable=False)
    offer_price = db.Column(db.Float, nullable=True)
    stock = db.Column(db.Integer, default=0, nullable=False)
    expiry_date = db.Column(db.String(100), nullable=True)
    manufacture_date = db.Column(db.String(100), nullable=True)
    image = db.Column(db.String(255), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "product_name": self.product_name,
            "variant": self.variant,
            "weight": self.weight,
            "price": self.price,
            "offer_price": self.offer_price,
            "stock": self.stock,
            "expiry_date": self.expiry_date,
            "manufacture_date": self.manufacture_date,
            "image": self.image
        }

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False, index=True)
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(100), default='Pending', nullable=False, index=True)  # 'Pending', 'Confirmed', 'Preparing', 'Out For Delivery', 'Delivered', 'Cancelled'
    payment_status = db.Column(db.String(100), default='Pending', nullable=False)
    delivery_address = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "total_amount": self.total_amount,
            "status": self.status,
            "payment_status": self.payment_status,
            "delivery_address": self.delivery_address,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, nullable=False, index=True)
    product_id = db.Column(db.Integer, nullable=False, index=True)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "product_id": self.product_id,
            "quantity": self.quantity,
            "price": self.price
        }

class CartItem(db.Model):
    __tablename__ = 'cart'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False, index=True)
    product_id = db.Column(db.Integer, nullable=False, index=True)
    quantity = db.Column(db.Integer, default=1, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "product_id": self.product_id,
            "quantity": self.quantity
        }

class BulkOrder(db.Model):
    __tablename__ = 'bulk_orders'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(255), nullable=False)
    mobile = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    event_type = db.Column(db.String(100), nullable=True)
    event_date = db.Column(db.String(100), nullable=False)
    guest_count = db.Column(db.Integer, nullable=True)
    location = db.Column(db.String(255), nullable=True)
    food_package = db.Column(db.String(255), nullable=True)
    special_request = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(100), default='Submitted', nullable=False)
    assigned_partner_id = db.Column(db.Integer, nullable=True)
    invoice_generated = db.Column(db.Boolean, default=False, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "customer_name": self.customer_name,
            "mobile": self.mobile,
            "email": self.email,
            "event_type": self.event_type,
            "event_date": self.event_date,
            "guest_count": self.guest_count,
            "location": self.location,
            "food_package": self.food_package,
            "special_request": self.special_request,
            "status": self.status,
            "assigned_partner_id": self.assigned_partner_id,
            "invoice_generated": self.invoice_generated
        }

class Review(db.Model):
    __tablename__ = 'reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    product_id = db.Column(db.Integer, nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1 to 5
    review = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(100), default='Pending', nullable=False)  # Pending, Approved, Rejected
    is_featured = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "product_id": self.product_id,
            "rating": self.rating,
            "review": self.review,
            "status": self.status,
            "is_featured": self.is_featured,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Coupon(db.Model):
    __tablename__ = 'coupons'
    
    id = db.Column(db.Integer, primary_key=True)
    coupon_code = db.Column(db.String(100), unique=True, nullable=False)
    discount_type = db.Column(db.String(50), default='percentage', nullable=False)  # 'percentage' or 'flat'
    discount_value = db.Column(db.Float, nullable=False)
    expiry_date = db.Column(db.String(100), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    usage_count = db.Column(db.Integer, default=0, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "coupon_code": self.coupon_code,
            "discount_type": self.discount_type,
            "discount_value": self.discount_value,
            "expiry_date": self.expiry_date,
            "is_active": self.is_active,
            "usage_count": self.usage_count
        }

class Inventory(db.Model):
    __tablename__ = 'inventory'
    
    id = db.Column(db.Integer, primary_key=True)
    item_name = db.Column(db.String(255), nullable=False)
    stock_quantity = db.Column(db.Integer, default=0, nullable=False)
    unit = db.Column(db.String(50), nullable=True)
    minimum_stock = db.Column(db.Integer, default=10, nullable=False)
    stock_used = db.Column(db.Integer, default=0, nullable=False)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "item_name": self.item_name,
            "stock_quantity": self.stock_quantity,
            "unit": self.unit,
            "minimum_stock": self.minimum_stock,
            "stock_used": self.stock_used,
            "remaining_stock": max(0, self.stock_quantity - self.stock_used),
            "last_updated": self.last_updated.isoformat() if self.last_updated else None
        }

class BatterProduction(db.Model):
    __tablename__ = 'batter_production'
    
    id = db.Column(db.Integer, primary_key=True)
    batter_type = db.Column(db.String(255), nullable=False)
    produced_quantity = db.Column(db.Float, nullable=False)
    sold_quantity = db.Column(db.Float, default=0.0, nullable=False)
    remaining_quantity = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(50), default='kg', nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "batter_type": self.batter_type,
            "produced_quantity": self.produced_quantity,
            "sold_quantity": self.sold_quantity,
            "remaining_quantity": self.remaining_quantity,
            "unit": self.unit,
            "date": self.date.isoformat() if self.date else None
        }

class DeliveryPartner(db.Model):
    __tablename__ = 'delivery_partners'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(50), nullable=False)
    assigned_orders = db.Column(db.String(255), default='', nullable=False)  # Comma-separated order IDs
    status = db.Column(db.String(100), default='Available', nullable=False)  # Available, Assigned, Out For Delivery, Delivered

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "phone": self.phone,
            "assigned_orders": self.assigned_orders,
            "status": self.status
        }

class WebsiteActivity(db.Model):
    __tablename__ = 'website_activity'
    
    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(50), nullable=False)
    activity_type = db.Column(db.String(100), nullable=False, index=True)  # 'page_view', 'product_view', 'add_to_cart', 'remove_from_cart', 'order_placed', 'customer_registered'
    product_id = db.Column(db.Integer, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "ip_address": self.ip_address,
            "activity_type": self.activity_type,
            "product_id": self.product_id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }

class KitchenStaff(db.Model):
    __tablename__ = 'kitchen_staff'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(50), nullable=False)
    specialty = db.Column(db.String(255), default='General Chef', nullable=False)  # e.g. 'Batter Specialist', 'Dosa Master'
    assigned_tasks = db.Column(db.String(255), default='', nullable=False)  # e.g. 'Prepare Dosa Batter ORD-10'
    status = db.Column(db.String(100), default='Available', nullable=False)  # Available, Cooking, On Break, Off Duty

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "phone": self.phone,
            "specialty": self.specialty,
            "assigned_tasks": self.assigned_tasks,
            "status": self.status
        }
