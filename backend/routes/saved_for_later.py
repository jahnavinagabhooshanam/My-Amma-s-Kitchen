from flask import Blueprint, request, jsonify
from database.db import db
from database.models import SavedForLater, Product
from routes.auth import decode_token

saved_for_later_bp = Blueprint('saved_for_later', __name__)

def get_current_user_id():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None
    return decode_token(auth_header)

@saved_for_later_bp.route('/', methods=['GET'])
def get_saved_for_later():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    saved_items = SavedForLater.query.filter_by(user_id=user_id).all()
    results = []
    for item in saved_items:
        prod = Product.query.get(item.product_id)
        if prod:
            prod_dict = prod.to_dict()
            prod_dict['saved_id'] = item.id
            results.append(prod_dict)
            
    return jsonify(results), 200

@saved_for_later_bp.route('/', methods=['POST'])
def add_to_saved_for_later():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
        
    data = request.get_json() or {}
    product_id = data.get('product_id')
    
    if not product_id:
        return jsonify({"error": "Product ID is required"}), 400
        
    # Check if already saved
    existing = SavedForLater.query.filter_by(user_id=user_id, product_id=product_id).first()
    if existing:
        return jsonify({"message": "Product already saved for later", "saved_item": existing.to_dict()}), 200
        
    new_item = SavedForLater(user_id=user_id, product_id=product_id)
    db.session.add(new_item)
    db.session.commit()
    
    return jsonify({"message": "Added to saved for later", "saved_item": new_item.to_dict()}), 201

@saved_for_later_bp.route('/<int:product_id>', methods=['DELETE'])
def remove_from_saved_for_later(product_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
        
    item = SavedForLater.query.filter_by(user_id=user_id, product_id=product_id).first()
    if not item:
        return jsonify({"error": "Item not found in saved for later"}), 404
        
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Removed from saved for later"}), 200
