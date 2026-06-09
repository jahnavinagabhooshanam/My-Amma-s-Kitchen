from flask import Blueprint, request, jsonify
from database.db import db
from database.models import ContactInquiry
from routes.auth import check_admin_auth

contact_bp = Blueprint('contact', __name__)

@contact_bp.route('/', methods=['POST'])
def submit_contact():
    data = request.get_json() or {}
    
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')
    
    if not name or not email or not message:
        return jsonify({"error": "Name, email, and message are required"}), 400
        
    inquiry = ContactInquiry(
        name=name,
        email=email,
        phone=data.get('phone'),
        subject=data.get('subject'),
        message=message
    )
    
    db.session.add(inquiry)
    db.session.commit()
    
    return jsonify({"message": "Inquiry submitted successfully", "inquiry": inquiry.to_dict()}), 201

@contact_bp.route('/', methods=['GET'])
def get_contacts():
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403
        
    inquiries = ContactInquiry.query.order_by(ContactInquiry.created_at.desc()).all()
    return jsonify([i.to_dict() for i in inquiries]), 200

@contact_bp.route('/<int:inquiry_id>', methods=['PUT'])
def update_contact_status(inquiry_id):
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403
        
    inquiry = ContactInquiry.query.get(inquiry_id)
    if not inquiry:
        return jsonify({"error": "Inquiry not found"}), 404
        
    data = request.get_json() or {}
    if 'status' in data:
        inquiry.status = data['status']
        
    db.session.commit()
    return jsonify({"message": "Status updated", "inquiry": inquiry.to_dict()}), 200

@contact_bp.route('/<int:inquiry_id>', methods=['DELETE'])
def delete_contact(inquiry_id):
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403
        
    inquiry = ContactInquiry.query.get(inquiry_id)
    if not inquiry:
        return jsonify({"error": "Inquiry not found"}), 404
        
    db.session.delete(inquiry)
    db.session.commit()
    return jsonify({"message": "Inquiry deleted"}), 200

@contact_bp.route('/clear', methods=['DELETE'])
def clear_all_contacts():
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403
        
    ContactInquiry.query.delete()
    db.session.commit()
    return jsonify({"message": "All inquiries cleared"}), 200
