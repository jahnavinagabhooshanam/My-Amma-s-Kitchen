from flask import Blueprint, request, jsonify
from database.db import db
from database.models import DeliveryPartner, Order, User, OrderItem, Product
from routes.auth import check_role_auth, decode_token

delivery_management_bp = Blueprint('delivery_management', __name__)

@delivery_management_bp.route('/', methods=['GET'])
def get_delivery_partners():
    auth_header = request.headers.get('Authorization')
    if not check_role_auth(auth_header, ['admin', 'manager', 'delivery_staff']):
        return jsonify({"error": "Admin or Manager access required"}), 403

    partners = DeliveryPartner.query.all()
    return jsonify([partner.to_dict() for partner in partners]), 200

@delivery_management_bp.route('/', methods=['POST'])
def add_delivery_partner():
    auth_header = request.headers.get('Authorization')
    if not check_role_auth(auth_header, ['admin', 'manager']):
        return jsonify({"error": "Admin or Manager access required"}), 403

    data = request.get_json() or {}
    name = data.get('name')
    phone = data.get('phone')
    status = data.get('status', 'Available')

    if not name or not phone:
        return jsonify({"error": "Name and phone number are required"}), 400

    new_partner = DeliveryPartner(
        name=name,
        phone=phone,
        status=status,
        assigned_orders=""
    )
    db.session.add(new_partner)
    db.session.commit()

    return jsonify({
        "message": "Delivery partner registered successfully",
        "partner": new_partner.to_dict()
    }), 201

@delivery_management_bp.route('/<int:partner_id>', methods=['PUT'])
def update_delivery_partner(partner_id):
    auth_header = request.headers.get('Authorization')
    if not check_role_auth(auth_header, ['admin', 'manager', 'delivery_staff']):
        return jsonify({"error": "Access denied"}), 403

    partner = DeliveryPartner.query.get(partner_id)
    if not partner:
        return jsonify({"error": "Delivery partner not found"}), 404

    data = request.get_json() or {}
    if 'name' in data:
        partner.name = data['name']
    if 'phone' in data:
        partner.phone = data['phone']
    if 'status' in data:
        partner.status = data['status']
    if 'assigned_orders' in data:
        partner.assigned_orders = data['assigned_orders']

    db.session.commit()
    return jsonify({
        "message": "Delivery partner details updated",
        "partner": partner.to_dict()
    }), 200

@delivery_management_bp.route('/<int:partner_id>', methods=['DELETE'])
def delete_delivery_partner(partner_id):
    auth_header = request.headers.get('Authorization')
    if not check_role_auth(auth_header, ['admin', 'manager']):
        return jsonify({"error": "Admin or Manager access required"}), 403

    partner = DeliveryPartner.query.get(partner_id)
    if not partner:
        return jsonify({"error": "Delivery partner not found"}), 404

    db.session.delete(partner)
    db.session.commit()

    return jsonify({"message": "Delivery partner unregistered successfully"}), 200

@delivery_management_bp.route('/<int:partner_id>/assign', methods=['PUT'])
def assign_order_to_partner(partner_id):
    auth_header = request.headers.get('Authorization')
    if not check_role_auth(auth_header, ['admin', 'manager']):
        return jsonify({"error": "Admin or Manager access required"}), 403

    partner = DeliveryPartner.query.get(partner_id)
    if not partner:
        return jsonify({"error": "Delivery partner not found"}), 404

    data = request.get_json() or {}
    order_id = data.get('order_id')
    if not order_id:
        return jsonify({"error": "order_id is required"}), 400

    # Add order to assigned list
    current_orders = partner.assigned_orders.split(',') if partner.assigned_orders else []
    
    # Strip whitespace and ORD- prefixes for comparison
    clean_target = str(order_id).strip()
    if clean_target not in [co.strip() for co in current_orders]:
        current_orders.append(clean_target)
        partner.assigned_orders = ','.join(current_orders)
        partner.status = "Assigned"
        
        # Update order status to Preparing or Out For Delivery
        try:
            numeric_id = int(clean_target.replace('ORD-', ''))
            order = Order.query.get(numeric_id)
            if order:
                order.status = "Out For Delivery"
        except Exception as e:
            print("Error parsing order ID on assign:", e)
            
        db.session.commit()

    return jsonify({
        "message": f"Order {order_id} assigned successfully to {partner.name}",
        "partner": partner.to_dict()
    }), 200


@delivery_management_bp.route('/my-orders', methods=['GET'])
def get_my_orders():
    auth_header = request.headers.get('Authorization')
    if not check_role_auth(auth_header, ['admin', 'manager', 'delivery_staff']):
        return jsonify({"error": "Unauthorized Access"}), 403

    user_id = decode_token(auth_header)
    if not user_id:
        return jsonify({"error": "Invalid login token"}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User profile not found"}), 404

    # Resolve Delivery partner by phone matching
    partner = DeliveryPartner.query.filter_by(phone=user.phone).first()
    if not partner:
        partner = DeliveryPartner.query.filter_by(name=user.name).first()

    if not partner or not partner.assigned_orders:
        return jsonify([]), 200

    assigned_orders_list = partner.assigned_orders.split(',')
    orders_data = []

    for order_str in assigned_orders_list:
        clean_str = order_str.strip().replace('ORD-', '')
        if not clean_str.isdigit():
            continue
        order_id = int(clean_str)
        o = Order.query.get(order_id)
        if o:
            cust = User.query.get(o.user_id)
            items = OrderItem.query.filter_by(order_id=o.id).all()
            mapped_items = []
            for it in items:
                p = Product.query.get(it.product_id)
                mapped_items.append({
                    "product_name": p.name if p else f"Product #{it.product_id}",
                    "quantity": it.quantity,
                    "price": it.price
                })
            
            orders_data.append({
                "id": o.id,
                "order_id_string": f"ORD-{o.id}",
                "customer_name": cust.name if cust else "Guest Customer",
                "phone": cust.phone if cust else (user.phone or "+91 99999 99999"),
                "total": o.total_amount,
                "status": o.status,
                "payment_status": o.payment_status,
                "delivery_address": o.delivery_address,
                "created_at": o.created_at.isoformat() + "Z" if o.created_at else None,
                "items": mapped_items
            })

    return jsonify(orders_data), 200
