from flask import Blueprint, request, jsonify
from database.db import db
from database.models import Address
from routes.auth import decode_token

addresses_bp = Blueprint('addresses', __name__)

def get_current_user_id():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None
    return decode_token(auth_header)

@addresses_bp.route('/', methods=['GET'])
def get_addresses():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    addresses = Address.query.filter_by(user_id=user_id).all()
    return jsonify([a.to_dict() for a in addresses]), 200

@addresses_bp.route('/', methods=['POST'])
def add_address():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
        
    data = request.get_json() or {}
    
    # Check if this is the first address, if so make it default
    existing = Address.query.filter_by(user_id=user_id).count()
    is_default = data.get('is_default', False)
    if existing == 0:
        is_default = True
        
    if is_default:
        # Unset other defaults
        Address.query.filter_by(user_id=user_id).update({"is_default": False})
        
    new_address = Address(
        user_id=user_id,
        label=data.get('label', 'Home'),
        door_number=data.get('door_number'),
        street_name=data.get('street_name'),
        area=data.get('area'),
        city=data.get('city'),
        state=data.get('state'),
        pincode=data.get('pincode'),
        landmark=data.get('landmark'),
        is_default=is_default
    )
    
    db.session.add(new_address)
    db.session.commit()
    return jsonify({"message": "Address added successfully", "address": new_address.to_dict()}), 201

@addresses_bp.route('/<int:address_id>', methods=['PUT'])
def update_address(address_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
        
    address = Address.query.filter_by(id=address_id, user_id=user_id).first()
    if not address:
        return jsonify({"error": "Address not found"}), 404
        
    data = request.get_json() or {}
    
    if data.get('is_default'):
        Address.query.filter_by(user_id=user_id).update({"is_default": False})
        address.is_default = True
        
    address.label = data.get('label', address.label)
    address.door_number = data.get('door_number', address.door_number)
    address.street_name = data.get('street_name', address.street_name)
    address.area = data.get('area', address.area)
    address.city = data.get('city', address.city)
    address.state = data.get('state', address.state)
    address.pincode = data.get('pincode', address.pincode)
    address.landmark = data.get('landmark', address.landmark)
    
    db.session.commit()
    return jsonify({"message": "Address updated successfully", "address": address.to_dict()}), 200

@addresses_bp.route('/<int:address_id>', methods=['DELETE'])
def delete_address(address_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
        
    address = Address.query.filter_by(id=address_id, user_id=user_id).first()
    if not address:
        return jsonify({"error": "Address not found"}), 404
        
    was_default = address.is_default
    db.session.delete(address)
    
    if was_default:
        next_address = Address.query.filter_by(user_id=user_id).first()
        if next_address:
            next_address.is_default = True
            
    db.session.commit()
    return jsonify({"message": "Address deleted successfully"}), 200
