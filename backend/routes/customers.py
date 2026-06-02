from flask import Blueprint, request, jsonify
from database.db import db
from database.models import User, Order
from sqlalchemy import func
from routes.auth import check_admin_auth, decode_token

customers_bp = Blueprint('customers', __name__)

@customers_bp.route('/', methods=['GET'])
def get_customers():
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403

    customers = User.query.filter_by(role='customer').all()
    results = []
    for c in customers:
        # Calculate order count and spend
        orders_count = Order.query.filter_by(user_id=c.id).count()
        spend_query = db.session.query(func.sum(Order.total_amount)).filter(Order.user_id == c.id, Order.status != 'Cancelled').scalar()
        total_spent = float(spend_query) if spend_query else 0.0
        
        # Get address from door_number/street/city
        address_parts = [c.door_number, c.street_name, c.area, c.city, c.pincode]
        address = ", ".join([p for p in address_parts if p])
        if not address:
            address = "Flat 4B, Lotus Apartments, Adyar, Chennai"  # Default if empty
            
        results.append({
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "phone": c.phone or '',
            "address": address,
            "orders_count": orders_count,
            "total_spent": total_spent,
            "is_blocked": not c.is_verified
        })
    return jsonify(results), 200

@customers_bp.route('/<int:customer_id>', methods=['GET'])
def get_customer(customer_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "Unauthorized"}), 401

    is_admin = check_admin_auth(auth_header)
    user_id = decode_token(auth_header)

    if not is_admin and user_id != customer_id:
        return jsonify({"error": "Forbidden"}), 403

    c = User.query.get(customer_id)
    if not c or c.role != 'customer':
        return jsonify({"error": "Customer not found"}), 404

    orders_count = Order.query.filter_by(user_id=c.id).count()
    spend_query = db.session.query(func.sum(Order.total_amount)).filter(Order.user_id == c.id, Order.status != 'Cancelled').scalar()
    total_spent = float(spend_query) if spend_query else 0.0

    address_parts = [c.door_number, c.street_name, c.area, c.city, c.pincode]
    address = ", ".join([p for p in address_parts if p])
    if not address:
        address = "Flat 4B, Lotus Apartments, Adyar, Chennai"

    return jsonify({
        "id": c.id,
        "name": c.name,
        "email": c.email,
        "phone": c.phone or '',
        "address": address,
        "orders_count": orders_count,
        "total_spent": total_spent,
        "is_blocked": not c.is_verified
    }), 200

@customers_bp.route('/<int:customer_id>', methods=['PUT'])
def update_customer(customer_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "Unauthorized"}), 401

    is_admin = check_admin_auth(auth_header)
    user_id = decode_token(auth_header)

    if not is_admin and user_id != customer_id:
        return jsonify({"error": "Forbidden"}), 403

    c = User.query.get(customer_id)
    if not c:
        return jsonify({"error": "Customer not found"}), 404

    data = request.get_json() or {}
    c.name = data.get('name', c.name)
    c.phone = data.get('phone', c.phone)
    if 'is_blocked' in data and is_admin:
        c.is_verified = not bool(data['is_blocked'])
    
    db.session.commit()

    return jsonify({
        "message": "Customer updated successfully",
        "customer": {
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "phone": c.phone or '',
            "is_blocked": not c.is_verified
        }
    }), 200

@customers_bp.route('/<int:customer_id>/toggle-block', methods=['PUT'])
def toggle_block_customer(customer_id):
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403

    c = User.query.get(customer_id)
    if not c or c.role != 'customer':
        return jsonify({"error": "Customer not found"}), 404

    # Toggle verification to represent block
    c.is_verified = not c.is_verified
    db.session.commit()

    return jsonify({
        "message": f"Customer {'blocked' if not c.is_verified else 'unblocked'} successfully",
        "is_blocked": not c.is_verified
    }), 200

@customers_bp.route('/<int:customer_id>', methods=['DELETE'])
def delete_customer(customer_id):
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403

    c = User.query.get(customer_id)
    if not c:
        return jsonify({"error": "Customer not found"}), 404

    db.session.delete(c)
    db.session.commit()
    return jsonify({"message": "Customer account deleted successfully"}), 200
