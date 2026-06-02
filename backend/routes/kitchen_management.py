from flask import Blueprint, request, jsonify
from database.db import db
from database.models import KitchenStaff, User
from routes.auth import check_role_auth, decode_token

kitchen_management_bp = Blueprint('kitchen_management', __name__)

@kitchen_management_bp.route('/', methods=['GET'])
def get_kitchen_staff():
    auth_header = request.headers.get('Authorization')
    if not check_role_auth(auth_header, ['admin', 'manager', 'kitchen_staff']):
        return jsonify({"error": "Admin, Manager or Kitchen Staff access required"}), 403

    staff = KitchenStaff.query.all()
    return jsonify([member.to_dict() for member in staff]), 200

@kitchen_management_bp.route('/', methods=['POST'])
def add_kitchen_member():
    auth_header = request.headers.get('Authorization')
    if not check_role_auth(auth_header, ['admin', 'manager']):
        return jsonify({"error": "Admin or Manager access required"}), 403

    data = request.get_json() or {}
    name = data.get('name')
    phone = data.get('phone')
    specialty = data.get('specialty', 'General Chef')
    status = data.get('status', 'Available')

    if not name or not phone:
        return jsonify({"error": "Name and phone number are required"}), 400

    new_member = KitchenStaff(
        name=name,
        phone=phone,
        specialty=specialty,
        status=status,
        assigned_tasks="None"
    )
    db.session.add(new_member)
    db.session.commit()

    return jsonify({
        "message": "Kitchen staff member registered successfully",
        "member": new_member.to_dict()
    }), 201

@kitchen_management_bp.route('/<int:staff_id>', methods=['PUT'])
def update_kitchen_member(staff_id):
    auth_header = request.headers.get('Authorization')
    if not check_role_auth(auth_header, ['admin', 'manager', 'kitchen_staff']):
        return jsonify({"error": "Access denied"}), 403

    member = KitchenStaff.query.get(staff_id)
    if not member:
        return jsonify({"error": "Kitchen staff member not found"}), 404

    data = request.get_json() or {}
    if 'name' in data:
        member.name = data['name']
    if 'phone' in data:
        member.phone = data['phone']
    if 'specialty' in data:
        member.specialty = data['specialty']
    if 'status' in data:
        member.status = data['status']
    if 'assigned_tasks' in data:
        member.assigned_tasks = data['assigned_tasks']

    db.session.commit()
    return jsonify({
        "message": "Kitchen staff member details updated",
        "member": member.to_dict()
    }), 200

@kitchen_management_bp.route('/<int:staff_id>/assign', methods=['PUT'])
def assign_task_to_member(staff_id):
    auth_header = request.headers.get('Authorization')
    if not check_role_auth(auth_header, ['admin', 'manager']):
        return jsonify({"error": "Admin or Manager access required"}), 403

    member = KitchenStaff.query.get(staff_id)
    if not member:
        return jsonify({"error": "Kitchen staff member not found"}), 404

    data = request.get_json() or {}
    task = data.get('task')
    if not task:
        return jsonify({"error": "task is required"}), 400

    member.assigned_tasks = task
    member.status = "Cooking"
    db.session.commit()

    return jsonify({
        "message": f"Task '{task}' assigned successfully to {member.name}",
        "member": member.to_dict()
    }), 200

@kitchen_management_bp.route('/<int:staff_id>', methods=['DELETE'])
def delete_kitchen_member(staff_id):
    auth_header = request.headers.get('Authorization')
    if not check_role_auth(auth_header, ['admin', 'manager']):
        return jsonify({"error": "Admin or Manager access required"}), 403

    member = KitchenStaff.query.get(staff_id)
    if not member:
        return jsonify({"error": "Kitchen staff member not found"}), 404

    db.session.delete(member)
    db.session.commit()
    return jsonify({"message": "Kitchen staff member deleted successfully"}), 200
