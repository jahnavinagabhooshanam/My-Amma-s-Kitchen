from flask import Blueprint, request, jsonify
from database.db import db
from database.models import CartItem, Product
from routes.auth import decode_token

cart_bp = Blueprint('cart', __name__)

def get_current_user_id():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None
    # Use proper JWT decode from auth module
    user_id = decode_token(auth_header)
    return user_id

@cart_bp.route('/', methods=['GET'])
def get_cart():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    cart_items = CartItem.query.filter_by(user_id=user_id).all()
    results = []
    for item in cart_items:
        prod = Product.query.get(item.product_id)
        if prod:
            results.append({
                "id": prod.id,
                "name": prod.name,
                "price": prod.price,
                "image": prod.image,
                "unit": getattr(prod, 'unit', '1kg Pouch') or '1kg Pouch',
                "quantity": item.quantity
            })
    return jsonify(results), 200

@cart_bp.route('/', methods=['POST'])
def add_to_cart():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
        
    data = request.get_json() or {}
    product_id = data.get('product_id') or data.get('id')
    quantity = data.get('quantity', 1)
    
    if not product_id:
        return jsonify({"error": "Product ID is required"}), 400
        
    # Check if product exists
    prod = Product.query.get(product_id)
    if not prod:
        return jsonify({"error": "Product not found"}), 404
        
    # Check if already in cart
    existing = CartItem.query.filter_by(user_id=user_id, product_id=product_id).first()
    
    current_qty = existing.quantity if existing else 0
    new_qty = current_qty + int(quantity)
    
    # Stock Validation (Phase 3 strict stock)
    if int(quantity) > 0 and prod.stock is not None:
        if prod.stock <= 0:
            return jsonify({"error": f"Product '{prod.name}' is completely out of stock."}), 400
        if new_qty > prod.stock:
            return jsonify({"error": f"Cannot add {quantity} more to cart. Only {prod.stock} items left in stock."}), 400

    if existing:
        existing.quantity = new_qty
        if existing.quantity <= 0:
            db.session.delete(existing)
            db.session.commit()
            return jsonify({"message": "Item removed from cart"}), 200
    else:
        if int(quantity) > 0:
            existing = CartItem(user_id=user_id, product_id=product_id, quantity=int(quantity))
            db.session.add(existing)
            
    db.session.commit()
    return jsonify({"message": "Cart updated", "cart_item": existing.to_dict() if existing in db.session else None}), 200

@cart_bp.route('/<int:product_id>', methods=['DELETE'])
def remove_from_cart(product_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
        
    existing = CartItem.query.filter_by(user_id=user_id, product_id=product_id).first()
    if not existing:
        return jsonify({"error": "Item not found in cart"}), 404
        
    db.session.delete(existing)
    db.session.commit()
    return jsonify({"message": "Item deleted from cart"}), 200
