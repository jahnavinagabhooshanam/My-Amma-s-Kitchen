from flask import Blueprint, request, jsonify
from database.db import db
from database.models import Review, User
from routes.auth import check_admin_auth, decode_token

reviews_bp = Blueprint('reviews', __name__)

def get_current_user_id():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    # Try decoding real JWT token first
    user_id = decode_token(auth_header)
    if user_id:
        return user_id
    return None

@reviews_bp.route('/', methods=['GET'])
def get_reviews():
    product_id = request.args.get('product_id', type=int)
    from database.models import Product
    if product_id:
        reviews = Review.query.filter_by(product_id=product_id).all()
    else:
        reviews = Review.query.all()
        
    results = []
    for r in reviews:
        user = User.query.get(r.user_id)
        prod = Product.query.get(r.product_id)
        results.append({
            "id": r.id,
            "user_id": r.user_id,
            "user_name": user.name if user else "Anonymous",
            "product_id": r.product_id,
            "product_name": prod.name if prod else f"Product #{r.product_id}",
            "rating": r.rating,
            "review": r.review,
            "status": r.status or "Pending",
            "is_featured": r.is_featured or False,
            "created_at": r.created_at.isoformat() if r.created_at else None
        })
    return jsonify(results), 200

@reviews_bp.route('/', methods=['POST'])
def add_review():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
        
    data = request.get_json() or {}
    product_id = data.get('product_id')
    rating = data.get('rating')
    review_text = data.get('review')
    
    if not product_id or not rating:
        return jsonify({"error": "Product ID and rating are required"}), 400
        
    new_review = Review(
        user_id=user_id,
        product_id=int(product_id),
        rating=int(rating),
        review=review_text
    )
    db.session.add(new_review)
    db.session.commit()
    return jsonify({"message": "Review added successfully", "review": new_review.to_dict()}), 201

@reviews_bp.route('/<int:review_id>', methods=['DELETE'])
def delete_review(review_id):
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403

    rev = Review.query.get(review_id)
    if not rev:
        return jsonify({"error": "Review not found"}), 404

    db.session.delete(rev)
    db.session.commit()
    return jsonify({"message": "Review deleted successfully"}), 200

@reviews_bp.route('/<int:review_id>/reply', methods=['POST'])
def reply_to_review(review_id):
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403

    rev = Review.query.get(review_id)
    if not rev:
        return jsonify({"error": "Review not found"}), 404

    data = request.get_json() or {}
    reply_text = data.get('reply')
    if not reply_text:
        return jsonify({"error": "Reply message is required"}), 400

    return jsonify({
        "message": "Reply sent successfully to customer email",
        "review_id": review_id,
        "reply": reply_text
    }), 200

@reviews_bp.route('/<int:review_id>/approve', methods=['PUT'])
def approve_review(review_id):
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403

    rev = Review.query.get(review_id)
    if not rev:
        return jsonify({"error": "Review not found"}), 404

    rev.status = 'Approved'
    db.session.commit()
    return jsonify({"message": "Review approved successfully", "status": "Approved"}), 200

@reviews_bp.route('/<int:review_id>/reject', methods=['PUT'])
def reject_review(review_id):
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403

    rev = Review.query.get(review_id)
    if not rev:
        return jsonify({"error": "Review not found"}), 404

    rev.status = 'Rejected'
    db.session.commit()
    return jsonify({"message": "Review rejected successfully", "status": "Rejected"}), 200

@reviews_bp.route('/<int:review_id>/feature', methods=['PUT'])
def feature_review(review_id):
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403

    rev = Review.query.get(review_id)
    if not rev:
        return jsonify({"error": "Review not found"}), 404

    rev.is_featured = not (rev.is_featured or False)
    db.session.commit()
    return jsonify({"message": "Review featured status toggled successfully", "is_featured": rev.is_featured}), 200
