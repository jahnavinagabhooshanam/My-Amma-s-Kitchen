from flask import Blueprint, request, jsonify
from datetime import datetime

bulkorders_bp = Blueprint('bulkorders', __name__)

# Mock bulk orders database
BULK_ORDERS_DB = [
    {
        "id": 5001,
        "customer_name": "Karthik Kalyanam",
        "company": "Karthik Caterers",
        "email": "cater@karthik.com",
        "phone": "+91 94440 12345",
        "event_date": "2026-06-15",
        "expected_guests": 250,
        "items_requested": "Classic Dosa Batter - 50 kg, Medu Vada Batter - 15 kg",
        "status": "Pending Quote",
        "created_at": "2026-05-30T08:00:00Z",
        "notes": "Need early morning delivery by 5:00 AM."
    }
]

@bulkorders_bp.route('/', methods=['GET'])
def get_bulk_orders():
    auth_header = request.headers.get('Authorization')
    if not auth_header or 'mock-jwt-token-for-admin' not in auth_header:
        return jsonify({"error": "Admin access required"}), 403

    return jsonify(BULK_ORDERS_DB), 200

@bulkorders_bp.route('/', methods=['POST'])
def submit_bulk_order():
    data = request.get_json() or {}
    customer_name = data.get('customer_name')
    email = data.get('email')
    phone = data.get('phone')
    event_date = data.get('event_date')
    items_requested = data.get('items_requested')

    if not customer_name or not email or not phone or not event_date or not items_requested:
        return jsonify({"error": "Missing required fields (name, email, phone, date, items)"}), 400

    new_bulk = {
        "id": len(BULK_ORDERS_DB) + 5001,
        "customer_name": customer_name,
        "company": data.get('company', ''),
        "email": email,
        "phone": phone,
        "event_date": event_date,
        "expected_guests": int(data.get('expected_guests', 0)),
        "items_requested": items_requested,
        "status": "Submitted",
        "created_at": datetime.utcnow().isoformat() + "Z",
        "notes": data.get('notes', '')
    }
    BULK_ORDERS_DB.append(new_bulk)
    return jsonify({"message": "Bulk order request submitted successfully", "bulk_order": new_bulk}), 201

@bulkorders_bp.route('/<int:bulk_id>', methods=['PUT'])
def update_bulk_order_status(bulk_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header or 'mock-jwt-token-for-admin' not in auth_header:
        return jsonify({"error": "Admin access required"}), 403

    bulk_order = next((b for b in BULK_ORDERS_DB if b['id'] == bulk_id), None)
    if not bulk_order:
        return jsonify({"error": "Bulk order request not found"}), 404

    data = request.get_json() or {}
    status = data.get('status')
    if not status:
        return jsonify({"error": "Status field is required"}), 400

    bulk_order['status'] = status
    return jsonify({"message": "Bulk order status updated", "bulk_order": bulk_order}), 200
