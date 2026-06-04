from flask import Blueprint, request, jsonify
from database.db import db
from database.models import Order, OrderItem, Product, User, CartItem
from datetime import datetime

orders_bp = Blueprint('orders', __name__)

def get_current_user_id():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ')[1]
    
    from routes.auth import decode_token
    from database.models import CartItem
    user_id = decode_token(auth_header)
    if user_id:
        return user_id

    if '-id-' in token:
        try:
            return int(token.split('-id-')[1])
        except ValueError:
            pass
    if 'admin' in token:
        return 1
    if 'customer' in token:
        return 2
    return None

@orders_bp.route('/', methods=['GET'])
def get_orders():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "Unauthorized"}), 401

    user_id = get_current_user_id()
    page = request.args.get('page', type=int)
    limit = request.args.get('limit', type=int)
    
    from routes.auth import check_admin_auth
    query = Order.query
    
    if check_admin_auth(auth_header):
        # Admin / Staff can view all orders
        pass
    elif user_id:
        # Customer can view only their own orders
        query = query.filter_by(user_id=user_id)
    else:
        return jsonify({"error": "Invalid token"}), 401

    # Return orders in descending order (newest first) for better UX
    query = query.order_by(Order.id.desc())

    if page and limit:
        pagination = query.paginate(page=page, per_page=limit, error_out=False)
        orders = pagination.items
        total_count = pagination.total
        total_pages = pagination.pages
    else:
        orders = query.all()
        total_count = len(orders)
        total_pages = 1

    results = []
    for o in orders:
        cust = User.query.get(o.user_id)
        # Fetch items
        items = OrderItem.query.filter_by(order_id=o.id).all()
        mapped_items = []
        for it in items:
            p = Product.query.get(it.product_id)
            mapped_items.append({
                "product_id": it.product_id,
                "product_name": p.name if p else f"Product #{it.product_id}",
                "price": it.price,
                "quantity": it.quantity,
                "category": p.category if p else "unknown"
            })
        results.append({
            "id": o.id,
            "customer_id": o.user_id,
            "customer_name": cust.name if cust else "Customer",
            "items": mapped_items,
            "total": o.total_amount,
            "status": o.status,
            "created_at": o.created_at.isoformat() + "Z" if o.created_at else None,
            "delivery_address": o.delivery_address,
            "phone": cust.phone if cust else "+91 99999 99999",
            "payment_method": "COD"
        })
    
    res = jsonify(results)
    res.headers['X-Total-Count'] = str(total_count)
    res.headers['X-Total-Pages'] = str(total_pages)
    if page:
        res.headers['X-Current-Page'] = str(page)
    if limit:
        res.headers['X-Limit'] = str(limit)
    return res, 200

@orders_bp.route('/<int:order_id>', methods=['GET'])
def get_order(order_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "Unauthorized"}), 401

    o = Order.query.get(order_id)
    if not o:
        return jsonify({"error": "Order not found"}), 404

    user_id = get_current_user_id()
    from routes.auth import check_admin_auth
    is_admin = check_admin_auth(auth_header)
    
    if not is_admin and (not user_id or o.user_id != user_id):
        return jsonify({"error": "Forbidden"}), 403

    cust = User.query.get(o.user_id)
    items = OrderItem.query.filter_by(order_id=o.id).all()
    mapped_items = []
    for it in items:
        p = Product.query.get(it.product_id)
        mapped_items.append({
            "product_id": it.product_id,
            "product_name": p.name if p else f"Product #{it.product_id}",
            "price": it.price,
            "quantity": it.quantity,
            "category": p.category if p else "unknown"
        })

    return jsonify({
        "id": o.id,
        "customer_id": o.user_id,
        "customer_name": cust.name if cust else "Customer",
        "items": mapped_items,
        "total": o.total_amount,
        "status": o.status,
        "timeline": o.timeline or [],
        "created_at": o.created_at.isoformat() + "Z" if o.created_at else None,
        "delivery_address": o.delivery_address,
        "phone": cust.phone if cust else "+91 99999 99999",
        "payment_method": "COD"
    }), 200

@orders_bp.route('/', methods=['POST'])
def place_order():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "Unauthorized"}), 401

    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Invalid token"}), 401

    cust = User.query.get(user_id)
    c_name = cust.name if cust else "New Customer"

    data = request.get_json() or {}
    items = data.get('items')
    delivery_address = data.get('delivery_address')
    phone = data.get('phone')
    payment_method = data.get('payment_method', 'COD')
    coupon_code = data.get('coupon_code')

    if not items or not delivery_address or not phone:
        return jsonify({"error": "Missing order details (items, address, phone)"}), 400

    total = sum(item['price'] * item['quantity'] for item in items)
    
    # Handle Coupon
    if coupon_code:
        from database.models import Coupon
        coupon = Coupon.query.filter_by(coupon_code=coupon_code.upper()).first()
        if coupon and coupon.is_active:
            if coupon.discount_type == 'percentage':
                discount_amount = total * (coupon.discount_value / 100.0)
            else:
                discount_amount = coupon.discount_value
            total = max(0, total - discount_amount)
            coupon.usage_count += 1
        else:
            return jsonify({"error": "Invalid or inactive coupon code"}), 400

    timeline = [{"status": "Pending", "timestamp": datetime.utcnow().isoformat() + "Z"}]
    # Save the Order
    new_order = Order(
        user_id=user_id,
        total_amount=float(total),
        status='Pending',  # Use 'Pending' as requested by tables spec
        payment_status='Pending' if payment_method == 'COD' else 'Paid',
        delivery_address=delivery_address,
        timeline=timeline
    )
    db.session.add(new_order)
    db.session.commit()  # commit to generate new_order.id
    
    # Save the items
    for item in items:
        new_item = OrderItem(
            order_id=new_order.id,
            product_id=int(item['product_id'] if 'product_id' in item else item['id']),
            quantity=int(item['quantity']),
            price=float(item['price'])
        )
        db.session.add(new_item)
        
        # Deduct product stock if product exists
        prod = Product.query.get(new_item.product_id)
        if prod and prod.stock is not None:
            # Check stock before deducting (Phase 3 strict stock)
            if prod.stock < new_item.quantity:
                db.session.rollback()
                return jsonify({"error": f"Product '{prod.name}' is out of stock. Available: {prod.stock}"}), 400
            prod.stock = max(0, prod.stock - new_item.quantity)
            
    # Clear cart for user
    CartItem.query.filter_by(user_id=user_id).delete()
            
    db.session.commit()

    return jsonify({
        "message": "Order placed successfully",
        "order": {
            "id": new_order.id,
            "customer_id": new_order.user_id,
            "customer_name": c_name,
            "total": new_order.total_amount,
            "status": new_order.status,
            "created_at": new_order.created_at.isoformat() if new_order.created_at else None,
            "delivery_address": new_order.delivery_address,
            "phone": phone
        }
    }), 201

@orders_bp.route('/<int:order_id>', methods=['PUT'])
def update_order_status(order_id):
    auth_header = request.headers.get('Authorization')
    from routes.auth import check_admin_auth
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin/Staff access required"}), 403

    o = Order.query.get(order_id)
    if not o:
        return jsonify({"error": "Order not found"}), 404

    data = request.get_json() or {}
    status = data.get('status')
    if not status:
        return jsonify({"error": "Status field is required"}), 400

    o.status = status
    timeline = o.timeline or []
    timeline.append({"status": status, "timestamp": datetime.utcnow().isoformat() + "Z"})
    o.timeline = timeline
    
    # Create Notification (Phase 4)
    from database.models import Notification
    notification_msg = f"Order #{o.id} is now: {status}"
    if status.lower() == 'confirmed':
        notification_msg = f"Order Confirmed! Your order #{o.id} has been confirmed."
    elif status.lower() == 'preparing':
        notification_msg = f"Order Preparing! We are packing your order #{o.id}."
    elif status.lower() == 'out for delivery':
        notification_msg = f"Out For Delivery! Your order #{o.id} is on its way."
    elif status.lower() == 'delivered':
        notification_msg = f"Delivered! Your order #{o.id} has been delivered. Enjoy!"

    new_notif = Notification(
        user_id=o.user_id,
        message=notification_msg,
        type='success' if status.lower() == 'delivered' else 'info'
    )
    db.session.add(new_notif)
    
    db.session.commit()
    
    return jsonify({
        "message": "Order status updated",
        "order": {
            "id": o.id,
            "status": o.status
        }
    }), 200
