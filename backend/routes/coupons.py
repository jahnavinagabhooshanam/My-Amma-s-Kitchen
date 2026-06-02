from flask import Blueprint, request, jsonify
from database.db import db
from database.models import Coupon
from routes.auth import check_admin_auth

coupons_bp = Blueprint('coupons', __name__)

@coupons_bp.route('/', methods=['GET'])
def get_coupons():
    coupons = Coupon.query.all()
    return jsonify([c.to_dict() for c in coupons]), 200

@coupons_bp.route('/<string:code>', methods=['GET'])
def validate_coupon(code):
    coupon = Coupon.query.filter_by(coupon_code=code.upper()).first()
    if not coupon:
        return jsonify({"error": "Coupon code is invalid"}), 404
        
    if not coupon.is_active:
        return jsonify({"error": "Coupon code is inactive"}), 400
        
    return jsonify({
        "message": "Coupon is valid",
        "coupon": coupon.to_dict()
    }), 200

@coupons_bp.route('/', methods=['POST'])
def create_coupon():
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403
        
    data = request.get_json() or {}
    code = data.get('coupon_code') or data.get('code')
    d_type = data.get('discount_type', 'percentage')
    d_value = data.get('discount_value')
    expiry = data.get('expiry_date')
    
    if not code or d_value is None:
        return jsonify({"error": "Coupon code and discount value are required"}), 400
        
    existing = Coupon.query.filter_by(coupon_code=code.upper()).first()
    if existing:
        return jsonify({"error": "Coupon code already exists"}), 409
        
    new_coupon = Coupon(
        coupon_code=code.upper(),
        discount_type=d_type,
        discount_value=float(d_value),
        expiry_date=expiry,
        is_active=True
    )
    db.session.add(new_coupon)
    db.session.commit()
    return jsonify({"message": "Coupon created successfully", "coupon": new_coupon.to_dict()}), 201

@coupons_bp.route('/<int:coupon_id>', methods=['PUT'])
def update_coupon(coupon_id):
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403

    coupon = Coupon.query.get(coupon_id)
    if not coupon:
        return jsonify({"error": "Coupon not found"}), 404

    data = request.get_json() or {}
    if 'coupon_code' in data or 'code' in data:
        code = data.get('coupon_code') or data.get('code')
        coupon.coupon_code = code.upper()
    if 'discount_type' in data:
        coupon.discount_type = data['discount_type']
    if 'discount_value' in data:
        coupon.discount_value = float(data['discount_value'])
    if 'expiry_date' in data:
        coupon.expiry_date = data['expiry_date']
    if 'is_active' in data:
        coupon.is_active = bool(data['is_active'])

    db.session.commit()
    return jsonify({"message": "Coupon updated successfully", "coupon": coupon.to_dict()}), 200

@coupons_bp.route('/<int:coupon_id>', methods=['DELETE'])
def delete_coupon(coupon_id):
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403

    coupon = Coupon.query.get(coupon_id)
    if not coupon:
        return jsonify({"error": "Coupon not found"}), 404

    db.session.delete(coupon)
    db.session.commit()
    return jsonify({"message": "Coupon deleted successfully"}), 200
