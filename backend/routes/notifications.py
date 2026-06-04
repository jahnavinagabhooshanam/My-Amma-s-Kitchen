from flask import Blueprint, request, jsonify
from database.db import db
from database.models import Notification
from routes.auth import decode_token

notifications_bp = Blueprint('notifications', __name__)

def get_current_user_id():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None
    return decode_token(auth_header)

@notifications_bp.route('/', methods=['GET'])
def get_notifications():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    notifications = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()
    return jsonify([n.to_dict() for n in notifications]), 200

@notifications_bp.route('/<int:notif_id>/read', methods=['PUT'])
def mark_as_read(notif_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    notification = Notification.query.filter_by(id=notif_id, user_id=user_id).first()
    if not notification:
        return jsonify({"error": "Notification not found"}), 404
        
    notification.is_read = True
    db.session.commit()
    return jsonify({"message": "Marked as read"}), 200
