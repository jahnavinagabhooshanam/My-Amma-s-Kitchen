from flask import Blueprint, request, jsonify
from database.db import db
from database.models import User
from routes.auth import check_role_auth
from werkzeug.security import generate_password_hash

user_management_bp = Blueprint('user_management', __name__)

@user_management_bp.route('/', methods=['GET'])
def get_users():
    auth_header = request.headers.get('Authorization')
    if not check_role_auth(auth_header, ['admin']):
        return jsonify({"error": "Super Admin access required"}), 403

    # Fetch all admins, managers, kitchen_staff, and delivery_staff
    users = User.query.filter(User.role.in_(['admin', 'manager', 'kitchen_staff', 'delivery_staff'])).all()
    return jsonify([u.to_dict() for u in users]), 200

@user_management_bp.route('/', methods=['POST'])
def add_user():
    auth_header = request.headers.get('Authorization')
    if not check_role_auth(auth_header, ['admin']):
        return jsonify({"error": "Super Admin access required"}), 403

    data = request.get_json() or {}
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    role = data.get('role')
    password = data.get('password')
    status = data.get('status', 'Active')

    if not name or not email or not role or not password:
        return jsonify({"error": "Name, email, role and password are required"}), 400

    existing = User.query.filter_by(email=email).first()
    if existing:
        return jsonify({"error": "User with this email already exists"}), 409

    hashed_pw = generate_password_hash(password)
    new_user = User(
        name=name,
        email=email,
        phone=phone,
        role=role,
        status=status,
        password_hash=hashed_pw
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "message": f"{role.replace('_', ' ').title()} added successfully",
        "user": new_user.to_dict()
    }), 201

@user_management_bp.route('/<int:user_id>', methods=['PUT'])
def edit_user(user_id):
    auth_header = request.headers.get('Authorization')
    if not check_role_auth(auth_header, ['admin']):
        return jsonify({"error": "Super Admin access required"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json() or {}
    if 'name' in data:
        user.name = data['name']
    if 'email' in data:
        new_email = data['email']
        if new_email != user.email:
            existing = User.query.filter_by(email=new_email).first()
            if existing:
                return jsonify({"error": "Email already in use"}), 409
            user.email = new_email
    if 'phone' in data:
        user.phone = data['phone']
    if 'role' in data:
        user.role = data['role']
    if 'status' in data:
        user.status = data['status']
    if 'permissions' in data:
        user.permissions = data['permissions']

    db.session.commit()
    return jsonify({
        "message": "User details updated successfully",
        "user": user.to_dict()
    }), 200

@user_management_bp.route('/<int:user_id>/toggle-status', methods=['PUT'])
def toggle_status(user_id):
    auth_header = request.headers.get('Authorization')
    if not check_role_auth(auth_header, ['admin']):
        return jsonify({"error": "Super Admin access required"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.status = 'Disabled' if user.status == 'Active' else 'Active'
    db.session.commit()

    return jsonify({
        "message": f"User status changed to {user.status}",
        "user": user.to_dict()
    }), 200

@user_management_bp.route('/<int:user_id>/reset-password', methods=['PUT'])
def reset_password(user_id):
    auth_header = request.headers.get('Authorization')
    if not check_role_auth(auth_header, ['admin']):
        return jsonify({"error": "Super Admin access required"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json() or {}
    password = data.get('password')
    if not password:
        return jsonify({"error": "New password is required"}), 400

    user.password_hash = generate_password_hash(password)
    db.session.commit()

    return jsonify({"message": "Password reset successful"}), 200

@user_management_bp.route('/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    auth_header = request.headers.get('Authorization')
    if not check_role_auth(auth_header, ['admin']):
        return jsonify({"error": "Super Admin access required"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Prevent deleting self
    from routes.auth import decode_token
    curr_user_id = decode_token(auth_header)
    if curr_user_id == user.id:
        return jsonify({"error": "You cannot delete your own Super Admin account"}), 400

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "User deleted successfully"}), 200
