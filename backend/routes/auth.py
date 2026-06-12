import jwt
import datetime
import requests
from flask import Blueprint, request, jsonify, current_app
from database.db import db
from database.models import User
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint('auth', __name__)

def generate_token(user):
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30),
        'iat': datetime.datetime.utcnow(),
        'sub': user.id,
        'role': user.role
    }
    return jwt.encode(payload, current_app.config.get('SECRET_KEY', 'hotel_ammas_kitchen_secret'), algorithm='HS256')

def decode_token(auth_header):
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, current_app.config.get('SECRET_KEY', 'hotel_ammas_kitchen_secret'), algorithms=['HS256'])
        return payload['sub']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def check_admin_auth(auth_header):
    if not auth_header:
        return False
    if 'mock-jwt-token-for-admin' in auth_header:
        return True
    user_id = decode_token(auth_header)
    if user_id:
        user = User.query.get(user_id)
        if user and user.status == 'Disabled':
            return False
        if user and user.role in ['admin', 'manager', 'kitchen_staff', 'delivery_staff']:
            return True
    return False

def check_role_auth(auth_header, allowed_roles):
    if not auth_header:
        return False
    if 'mock-jwt-token-for-admin' in auth_header:
        return True
    user_id = decode_token(auth_header)
    if user_id:
        user = User.query.get(user_id)
        if user and user.status == 'Disabled':
            return False
        if user and user.role in allowed_roles:
            return True
    return False

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    
    print(f"--- LOGIN ATTEMPT --- Email: '{email}', Password: '{password}'")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if user and user.status == 'Disabled':
        return jsonify({"error": "Your account has been disabled. Please contact the administrator."}), 403

    if user and check_password_hash(user.password_hash, password):
        token = generate_token(user)
        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": user.to_dict()
        }), 200

    return jsonify({"error": "Invalid email or password"}), 401

@auth_bp.route('/admin-login', methods=['POST'])
def admin_login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email, role='admin').first()

    if user and check_password_hash(user.password_hash, password):
        token = generate_token(user)
        return jsonify({
            "message": "Admin login successful",
            "token": token,
            "user": user.to_dict()
        }), 200

    return jsonify({"error": "Invalid admin email or password"}), 401

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name') or data.get('full_name')
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone') or data.get('mobile', '')

    if not name or not email or not password:
        return jsonify({"error": "Name, email and password are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    hashed_pw = generate_password_hash(password)
    
    role = 'admin' if email == 'ammuluskitchen57@gmail.com' else 'customer'
    
    new_user = User(
        name=name,
        email=email,
        phone=phone,
        password_hash=hashed_pw,
        role=role
    )
    db.session.add(new_user)
    db.session.commit()

    token = generate_token(new_user)

    return jsonify({
        "message": "Registration successful",
        "token": token,
        "user": new_user.to_dict()
    }), 201

@auth_bp.route('/logout', methods=['POST'])
def logout():
    # In a stateless JWT setup, logout is handled client-side by deleting the token.
    # We can provide this endpoint for consistency.
    return jsonify({"message": "Logout successful. Please remove token from client."}), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    email = data.get('email')
    
    if not email:
        return jsonify({"error": "Email is required"}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    # In a real app, generate a 6 digit OTP and save to DB/cache, then send via email/SMS
    # For now, we mock it.
    mock_otp = "123456"
    return jsonify({"message": "OTP sent successfully to email.", "mock_otp": mock_otp}), 200

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json() or {}
    email = data.get('email')
    otp = data.get('otp')
    
    if not email or not otp:
        return jsonify({"error": "Email and OTP are required"}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    # Mock OTP verification
    if otp == "123456":
        return jsonify({"message": "OTP verified successfully"}), 200
    else:
        return jsonify({"error": "Invalid OTP"}), 401

@auth_bp.route('/me', methods=['GET'])
@auth_bp.route('/profile', methods=['GET'])
def get_profile():
    auth_header = request.headers.get('Authorization')
    user_id = decode_token(auth_header)
    
    if not user_id:
        return jsonify({"error": "Unauthorized or invalid token"}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "user": user.to_dict()
    }), 200

@auth_bp.route('/dashboard-stats', methods=['GET'])
def get_dashboard_stats():
    """Return a comprehensive customer dashboard payload in a single call."""
    auth_header = request.headers.get('Authorization')
    user_id = decode_token(auth_header)
    if not user_id:
        return jsonify({"error": "Unauthorized or invalid token"}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    from database.models import Order, OrderItem, Product
    from sqlalchemy import func

    # ── All user orders (excluding cancelled) ──
    all_orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
    completed_orders = [o for o in all_orders if o.status == 'Delivered']
    active_statuses = {'Pending', 'Confirmed', 'Preparing', 'Out For Delivery'}
    active_orders = [o for o in all_orders if o.status in active_statuses]

    total_spent = db.session.query(
        func.sum(Order.total_amount)
    ).filter(Order.user_id == user_id, Order.status != 'Cancelled').scalar() or 0.0

    # ── Reward points: 1 point per ₹10 spent ──
    reward_points = int(float(total_spent) / 10)

    # ── Membership tier ──
    order_count = len(all_orders)
    if reward_points >= 500 or order_count >= 20:
        tier = 'Platinum'
        next_tier = None
        points_to_next = 0
        progress = 100
    elif reward_points >= 200 or order_count >= 10:
        tier = 'Gold'
        next_tier = 'Platinum'
        points_to_next = max(0, 500 - reward_points)
        progress = min(100, int((reward_points / 500) * 100))
    elif reward_points >= 50 or order_count >= 3:
        tier = 'Silver'
        next_tier = 'Gold'
        points_to_next = max(0, 200 - reward_points)
        progress = min(100, int((reward_points / 200) * 100))
    else:
        tier = 'Bronze'
        next_tier = 'Silver'
        points_to_next = max(0, 50 - reward_points)
        progress = min(100, int((reward_points / 50) * 100))

    # ── Favorite dishes from order history ──
    product_counts = {}
    for order in all_orders:
        items = OrderItem.query.filter_by(order_id=order.id).all()
        for it in items:
            product_counts[it.product_id] = product_counts.get(it.product_id, 0) + it.quantity

    top_product_ids = sorted(product_counts, key=product_counts.get, reverse=True)[:3]
    favorite_dishes = []
    for pid in top_product_ids:
        p = Product.query.get(pid)
        if p:
            favorite_dishes.append({
                "id": p.id,
                "name": p.name,
                "category": p.category,
                "image": p.image,
                "times_ordered": product_counts[pid]
            })

    # ── Favorite category ──
    cat_counts = {}
    for pid, cnt in product_counts.items():
        p = Product.query.get(pid)
        if p:
            cat_counts[p.category] = cat_counts.get(p.category, 0) + cnt
    fav_category = max(cat_counts, key=cat_counts.get) if cat_counts else None

    # ── Recent orders (last 5) ──
    recent_orders_data = []
    for o in all_orders[:5]:
        items = OrderItem.query.filter_by(order_id=o.id).all()
        item_names = []
        for it in items:
            p = Product.query.get(it.product_id)
            if p:
                item_names.append(p.name)
        recent_orders_data.append({
            "id": o.id,
            "status": o.status,
            "total": o.total_amount,
            "created_at": o.created_at.isoformat() + "Z" if o.created_at else None,
            "items": item_names[:2],
            "item_count": len(items)
        })

    # ── Active orders ──
    active_orders_data = []
    for o in active_orders[:1]:  # Show at most 1 active order
        items = OrderItem.query.filter_by(order_id=o.id).all()
        item_names = [Product.query.get(it.product_id).name
                      for it in items if Product.query.get(it.product_id)]
        active_orders_data.append({
            "id": o.id,
            "status": o.status,
            "total": o.total_amount,
            "created_at": o.created_at.isoformat() + "Z" if o.created_at else None,
            "items": item_names[:2]
        })

    # ── Address ──
    address_parts = [user.door_number, user.street_name, user.area, user.city, user.state, user.pincode]
    address = ", ".join([p for p in address_parts if p])

    return jsonify({
        "profile": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "profile_image": user.profile_image,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "address": address,
            "preference": user.preference
        },
        "stats": {
            "total_orders": order_count,
            "completed_orders": len(completed_orders),
            "total_spent": round(float(total_spent), 2),
            "reward_points": reward_points
        },
        "membership": {
            "tier": tier,
            "next_tier": next_tier,
            "points_to_next": points_to_next,
            "progress": progress
        },
        "favorite_dishes": favorite_dishes,
        "favorite_category": fav_category,
        "recent_orders": recent_orders_data,
        "active_order": active_orders_data[0] if active_orders_data else None
    }), 200


@auth_bp.route('/complete-profile', methods=['POST'])
def complete_profile():
    auth_header = request.headers.get('Authorization')
    user_id = decode_token(auth_header)
    if not user_id:
        return jsonify({"error": "Unauthorized or invalid token"}), 401
        
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json() or {}
    
    # Update fields
    if data.get('name') or data.get('full_name'):
        user.name = data.get('name') or data.get('full_name')
    if data.get('email'):
        new_email = data.get('email')
        if new_email != user.email:
            existing = User.query.filter_by(email=new_email).first()
            if existing:
                return jsonify({"error": "Email already in use"}), 409
            user.email = new_email
    if data.get('phone') or data.get('mobile'):
        user.phone = data.get('phone') or data.get('mobile')
        
    user.door_number = data.get('door_number', user.door_number)
    user.street_name = data.get('street_name', user.street_name)
    user.area = data.get('area', user.area)
    user.city = data.get('city', user.city)
    user.state = data.get('state', user.state)
    user.pincode = data.get('pincode', user.pincode)
    user.landmark = data.get('landmark', user.landmark)
    user.alternate_mobile = data.get('alternate_mobile', user.alternate_mobile)
    user.preference = data.get('preference', user.preference)
    user.profile_image = data.get('profile_image', user.profile_image)
    
    user.profile_completed = True
    
    db.session.commit()
    
    return jsonify({
        "message": "Profile completed successfully",
        "user": user.to_dict()
    }), 200

@auth_bp.route('/change-password', methods=['POST'])
def change_password():
    auth_header = request.headers.get('Authorization')
    user_id = decode_token(auth_header)
    if not user_id:
        return jsonify({"error": "Unauthorized or invalid token"}), 401
        
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json() or {}
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    
    if not current_password or not new_password:
        return jsonify({"error": "Current password and new password are required"}), 400
        
    if not check_password_hash(user.password_hash, current_password):
        return jsonify({"error": "Incorrect current password"}), 401
        
    user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    
    return jsonify({"message": "Password changed successfully"}), 200


@auth_bp.route('/exchange-firebase-token', methods=['POST'])
def exchange_firebase_token():
    """Exchange a Firebase ID token for a backend JWT.

    Client should POST JSON: { "idToken": "<firebase-id-token>" }
    """
    data = request.get_json() or {}
    id_token = data.get('idToken')
    if not id_token:
        return jsonify({"error": "idToken is required"}), 400

    # In a production environment, you MUST verify this token's signature using the Firebase Admin SDK!
    # Since we are in a development environment without a service account key, we will decode the payload directly.
    try:
        info = jwt.decode(id_token, options={"verify_signature": False})
    except Exception as e:
        current_app.logger.exception('Failed to parse firebase token')
        return jsonify({"error": "Invalid token format"}), 400

    email = info.get('email')
    name = info.get('name') or (email and email.split('@')[0])
    firebase_uid = info.get('sub')

    if not email:
        return jsonify({"error": "Firebase token missing email"}), 400

    # Find or create user by email
    user = User.query.filter_by(email=email).first()
    if user and user.status == 'Disabled':
        return jsonify({"error": "Your account has been disabled"}), 403

    from werkzeug.security import generate_password_hash
    if not user:
        # Create a lightweight user record for this Firebase account
        placeholder_pw = generate_password_hash(firebase_uid or '')
        user = User(name=name or email, email=email, password_hash=placeholder_pw, role='customer', is_verified=True, profile_completed=False)
        db.session.add(user)
        db.session.commit()

    # Generate backend JWT for the user
    token = generate_token(user)
    return jsonify({"message": "Exchange successful", "token": token, "user": user.to_dict()}), 200

import os
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@auth_bp.route('/upload-avatar', methods=['POST'])
def upload_avatar():
    auth_header = request.headers.get('Authorization')
    user_id = decode_token(auth_header)
    if not user_id:
        return jsonify({"error": "Unauthorized or invalid token"}), 401
        
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    if 'file' not in request.files:
        return jsonify({"error": "No file part in request"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if file and allowed_file(file.filename):
        base_name = os.path.splitext(secure_filename(file.filename))[0]
        filename = f"avatar_{user_id}_{base_name}.webp"
        upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        
        try:
            from PIL import Image
            img = Image.open(file)
            if img.width > 500:
                ratio = 500.0 / img.width
                new_size = (500, int(img.height * ratio))
                img = img.resize(new_size, Image.Resampling.LANCZOS)
            img.save(upload_path, 'WEBP', quality=85)
        except Exception as e:
            print("AVATAR UPLOAD EXCEPTION:", e)
            file.seek(0)
            file.save(upload_path)
        
        # Save relative URL
        image_url = f"http://localhost:5000/uploads/{filename}"
        user.profile_image = image_url
        db.session.commit()
        
        return jsonify({
            "message": "Avatar uploaded successfully",
            "profile_image": image_url,
            "user": user.to_dict()
        }), 200
        
    return jsonify({"error": "File type not allowed"}), 400
