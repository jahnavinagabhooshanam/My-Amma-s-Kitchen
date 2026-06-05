from flask import Blueprint, request, jsonify
from database.db import db
from database.models import BatterProduction
from datetime import datetime
from routes.auth import check_admin_auth

batter_production_bp = Blueprint('batter_production', __name__)

@batter_production_bp.route('/', methods=['GET'])
def get_production_logs():
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403

    logs = BatterProduction.query.order_by(BatterProduction.date.desc()).all()
    return jsonify([log.to_dict() for log in logs]), 200

@batter_production_bp.route('/', methods=['POST'])
def add_production_entry():
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json() or {}
    batter_type = data.get('batter_type')
    produced = data.get('produced_quantity')
    sold = data.get('sold_quantity', 0.0)
    unit = data.get('unit', 'kg')

    if not batter_type or produced is None:
        return jsonify({"error": "Batter type and produced quantity are required"}), 400

    produced_val = float(produced)
    sold_val = float(sold)
    remaining_val = max(0.0, produced_val - sold_val)

    new_log = BatterProduction(
        batter_type=batter_type,
        produced_quantity=produced_val,
        sold_quantity=sold_val,
        remaining_quantity=remaining_val,
        unit=unit,
        date=datetime.utcnow()
    )
    db.session.add(new_log)
    db.session.commit()

    return jsonify({
        "message": "Production log added successfully",
        "production": new_log.to_dict()
    }), 201

@batter_production_bp.route('/<int:log_id>', methods=['PUT'])
def update_production_entry(log_id):
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403

    log = BatterProduction.query.get(log_id)
    if not log:
        return jsonify({"error": "Production record not found"}), 404

    data = request.get_json() or {}
    
    if 'batter_type' in data:
        log.batter_type = data['batter_type']
    if 'produced_quantity' in data:
        log.produced_quantity = float(data['produced_quantity'])
    if 'sold_quantity' in data:
        log.sold_quantity = float(data['sold_quantity'])
    if 'unit' in data:
        log.unit = data['unit']

    log.remaining_quantity = max(0.0, log.produced_quantity - log.sold_quantity)
    db.session.commit()

    return jsonify({
        "message": "Production log updated successfully",
        "production": log.to_dict()
    }), 200

@batter_production_bp.route('/summary', methods=['GET'])
def get_production_summary():
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403

    # Aggregate produced, sold, and remaining quantities for today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_logs = BatterProduction.query.filter(BatterProduction.date >= today_start).all()

    total_produced = sum(log.produced_quantity for log in today_logs)
    total_sold = sum(log.sold_quantity for log in today_logs)
    total_remaining = sum(log.remaining_quantity for log in today_logs)

    return jsonify({
        "date": today_start.strftime("%Y-%m-%d"),
        "total_produced": total_produced,
        "total_sold": total_sold,
        "total_remaining": total_remaining,
        "unit": "kg"
    }), 200
