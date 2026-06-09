from flask import Blueprint, request, jsonify
from database.db import db
from database.models import BulkOrder
from datetime import datetime
from routes.auth import check_admin_auth

bulk_orders_bp = Blueprint('bulk_orders', __name__)

@bulk_orders_bp.route('/', methods=['GET'])
def get_bulk_orders():
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403

    orders = BulkOrder.query.all()
    # Map back to old mock fields to preserve compatibility
    results = []
    for o in orders:
        results.append({
            "id": o.id,
            "customer_name": o.customer_name,
            "company": o.food_package or '',
            "event_type": o.event_type or '',
            "location": o.location or '',
            "email": o.email,
            "phone": o.mobile,
            "event_date": o.event_date,
            "expected_guests": o.guest_count or 0,
            "items_requested": o.special_request or '',
            "status": o.status,
            "created_at": o.event_date + "T00:00:00Z",
            "assigned_partner_id": o.assigned_partner_id,
            "invoice_generated": o.invoice_generated
        })
    return jsonify(results), 200

@bulk_orders_bp.route('/', methods=['POST'])
def submit_bulk_order():
    data = request.get_json() or {}
    customer_name = data.get('customer_name') or data.get('name')
    email = data.get('email')
    phone = data.get('mobile') or data.get('phone')
    event_date = data.get('event_date') or data.get('date')
    items_requested = data.get('special_request') or data.get('items_requested') or data.get('items') or data.get('notes', '')
    company = data.get('event_type') or data.get('company', '')
    food_package = data.get('food_package') or company

    if not customer_name or not email or not phone or not event_date:
        return jsonify({"error": "Missing required fields (name, email, phone, date)"}), 400

    new_bulk = BulkOrder(  # type: ignore
        customer_name=customer_name,
        mobile=phone,
        email=email,
        event_type=company,  # store company here
        event_date=event_date,
        guest_count=int(data.get('guest_count') or data.get('expected_guests') or data.get('guests') or 0),
        location=data.get('location', ''),
        food_package=food_package,
        special_request=items_requested,
        status='Submitted'
    )
    db.session.add(new_bulk)
    db.session.commit()
    
    return jsonify({
        "message": "Bulk order request submitted successfully",
        "bulk_order": {
            "id": new_bulk.id,
            "customer_name": new_bulk.customer_name,
            "company": new_bulk.event_type,
            "email": new_bulk.email,
            "phone": new_bulk.mobile,
            "event_date": new_bulk.event_date,
            "expected_guests": new_bulk.guest_count,
            "items_requested": new_bulk.special_request,
            "status": new_bulk.status,
            "created_at": new_bulk.event_date
        }
    }), 201

@bulk_orders_bp.route('/<int:bulk_id>', methods=['PUT'])
def update_bulk_order_status(bulk_id):
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403

    bulk_order = BulkOrder.query.get(bulk_id)
    if not bulk_order:
        return jsonify({"error": "Bulk order request not found"}), 404

    data = request.get_json() or {}
    if 'status' in data:
        bulk_order.status = data['status']
    if 'assigned_partner_id' in data:
        partner_id = data['assigned_partner_id']
        bulk_order.assigned_partner_id = int(partner_id) if partner_id else None
    if 'invoice_generated' in data:
        bulk_order.invoice_generated = bool(data['invoice_generated'])

    db.session.commit()
    return jsonify({
        "message": "Bulk order updated successfully",
        "bulk_order": bulk_order.to_dict()
      }), 200
