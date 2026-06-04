from flask import Blueprint, request, jsonify
from database.db import db
from database.models import Wishlist, Product
from routes.auth import decode_token

wishlist_bp = Blueprint('wishlist', __name__)

def get_current_user_id():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None
    return decode_token(auth_header)

@wishlist_bp.route('/', methods=['GET'])
def get_wishlist():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    wishlist_items = Wishlist.query.filter_by(user_id=user_id).all()
    results = []
    for item in wishlist_items:
        prod = Product.query.get(item.product_id)
        if prod:
            prod_dict = prod.to_dict()
            prod_dict['wishlist_id'] = item.id
            results.append(prod_dict)
            
    return jsonify(results), 200

@wishlist_bp.route('/', methods=['POST'])
def add_to_wishlist():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
        
    data = request.get_json() or {}
    product_id = data.get('product_id')
    
    if not product_id:
        return jsonify({"error": "Product ID is required"}), 400
        
    # Check if already in wishlist
    existing = Wishlist.query.filter_by(user_id=user_id, product_id=product_id).first()
    if existing:
        return jsonify({"message": "Product already in wishlist", "wishlist_item": existing.to_dict()}), 200
        
    new_item = Wishlist(user_id=user_id, product_id=product_id)
    db.session.add(new_item)
    db.session.commit()
    
    return jsonify({"message": "Added to wishlist", "wishlist_item": new_item.to_dict()}), 201

@wishlist_bp.route('/<int:product_id>', methods=['DELETE'])
def remove_from_wishlist(product_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
        
    item = Wishlist.query.filter_by(user_id=user_id, product_id=product_id).first()
    if not item:
        return jsonify({"error": "Item not found in wishlist"}), 404
        
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Removed from wishlist"}), 200
