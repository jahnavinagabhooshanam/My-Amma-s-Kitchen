from functools import wraps
from flask import request, jsonify
from middleware.auth import decode_auth_token
from database.models import User, RolePermission

def get_current_user():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ')[1]
    payload = decode_auth_token(token)
    if isinstance(payload, str):
        return None
    user = User.query.get(payload['sub'])
    return user

def checkRole(allowed_roles):
    """
    Decorator to restrict access to specific roles.
    allowed_roles: list of role names (e.g., ['SUPER_ADMIN', 'MANAGER'])
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user = get_current_user()
            if not user:
                return jsonify({'error': 'Unauthorized access', 'code': 401}), 401
                
            if user.role not in allowed_roles and user.role != 'SUPER_ADMIN':
                return jsonify({'error': 'Forbidden: Insufficient role permissions', 'code': 403}), 403
                
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def checkPermission(required_permission):
    """
    Decorator to restrict access to specific permissions.
    required_permission: string (e.g., 'edit_product')
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user = get_current_user()
            if not user:
                return jsonify({'error': 'Unauthorized access', 'code': 401}), 401
                
            if user.role == 'SUPER_ADMIN':
                return f(*args, **kwargs)
                
            role_perm = RolePermission.query.filter_by(role=user.role).first()
            if not role_perm or required_permission not in role_perm.permissions:
                return jsonify({'error': 'Forbidden: Missing required permission', 'code': 403}), 403
                
            return f(*args, **kwargs)
        return decorated_function
    return decorator
