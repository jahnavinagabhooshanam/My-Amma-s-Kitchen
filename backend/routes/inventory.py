from flask import Blueprint, request, jsonify
from database.db import db
from database.models import Inventory
from routes.auth import check_admin_auth

inventory_bp = Blueprint('inventory', __name__)

@inventory_bp.route('/', methods=['GET'])
def get_inventory():
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403

    items = Inventory.query.all()
    # Map back to old mock fields to preserve frontend compatibility
    results = []
    for item in items:
        # Determine status
        if item.stock_quantity <= 0:
            status = "Out of Stock"
        elif item.stock_quantity < item.minimum_stock:
            status = "Low Stock"
        else:
            status = "In Stock"
            
        results.append({
            "id": item.id,
            "product_name": item.item_name,
            "stock": item.stock_quantity,
            "stock_used": item.stock_used or 0,
            "remaining_stock": max(0, item.stock_quantity - (item.stock_used or 0)),
            "min_required": item.minimum_stock,
            "status": status,
            "unit": item.unit or 'Pcs'
        })
    return jsonify(results), 200

@inventory_bp.route('/<int:item_id>', methods=['PUT'])
def update_stock(item_id):
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403

    item = Inventory.query.get(item_id)
    if not item:
        return jsonify({"error": "Inventory item not found"}), 404

    data = request.get_json() or {}
    
    if 'stock' in data or 'stock_quantity' in data:
        item.stock_quantity = int(data.get('stock') or data.get('stock_quantity'))
    if 'stock_used' in data:
        item.stock_used = int(data.get('stock_used'))
    if 'product_name' in data or 'item_name' in data:
        item.item_name = data.get('product_name') or data.get('item_name')
    if 'min_required' in data or 'minimum_stock' in data:
        item.minimum_stock = int(data.get('min_required') or data.get('minimum_stock'))
    if 'unit' in data:
        item.unit = data.get('unit')

    db.session.commit()

    if item.stock_quantity <= 0:
        status = "Out of Stock"
    elif (item.stock_quantity - (item.stock_used or 0)) < item.minimum_stock:
        status = "Low Stock"
    else:
        status = "In Stock"

    return jsonify({
        "message": "Inventory updated successfully",
        "inventory": {
            "id": item.id,
            "product_name": item.item_name,
            "stock": item.stock_quantity,
            "stock_used": item.stock_used or 0,
            "remaining_stock": max(0, item.stock_quantity - (item.stock_used or 0)),
            "min_required": item.minimum_stock,
            "status": status,
            "unit": item.unit
        }
    }), 200

@inventory_bp.route('/', methods=['POST'])
def create_inventory_item():
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json() or {}
    item_name = data.get('product_name') or data.get('item_name')
    stock = data.get('stock') or data.get('stock_quantity') or 0
    stock_used = data.get('stock_used') or 0
    min_required = data.get('min_required') or data.get('minimum_stock') or 10
    unit = data.get('unit', 'kg')

    if not item_name:
        return jsonify({"error": "Item name is required"}), 400

    new_item = Inventory(
        item_name=item_name,
        stock_quantity=int(stock),
        stock_used=int(stock_used),
        unit=unit,
        minimum_stock=int(min_required)
    )
    db.session.add(new_item)
    db.session.commit()

    if new_item.stock_quantity <= 0:
        status = "Out of Stock"
    elif (new_item.stock_quantity - new_item.stock_used) < new_item.minimum_stock:
        status = "Low Stock"
    else:
        status = "In Stock"

    return jsonify({
        "message": "Inventory item created successfully",
        "inventory": {
            "id": new_item.id,
            "product_name": new_item.item_name,
            "stock": new_item.stock_quantity,
            "stock_used": new_item.stock_used,
            "remaining_stock": max(0, new_item.stock_quantity - new_item.stock_used),
            "min_required": new_item.minimum_stock,
            "status": status,
            "unit": new_item.unit
        }
    }), 201

@inventory_bp.route('/<int:item_id>', methods=['DELETE'])
def delete_inventory_item(item_id):
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403

    item = Inventory.query.get(item_id)
    if not item:
        return jsonify({"error": "Inventory item not found"}), 404

    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Inventory item deleted successfully"}), 200
