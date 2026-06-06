from flask import Blueprint, request, jsonify
from database.db import db
from database.models import Offer
from routes.auth import check_admin_auth
from sockets import emit_update
from datetime import datetime

offers_bp = Blueprint('offers', __name__)

# Admin: Get all offers
@offers_bp.route('/', methods=['GET'])
def get_all_offers():
    try:
        offers = Offer.query.order_by(Offer.created_at.desc()).all()
        return jsonify([offer.to_dict() for offer in offers]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Public: Get active offers
@offers_bp.route('/active', methods=['GET'])
def get_active_offers():
    try:
        # Here we could also check start_date and end_date if we parse them,
        # but for simplicity we rely on status='Active' for now.
        offers = Offer.query.filter_by(status='Active').all()
        return jsonify([offer.to_dict() for offer in offers]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Admin: Create offer
@offers_bp.route('/', methods=['POST'])
def create_offer():
    try:
        data = request.json
        if not data or not data.get('title') or not data.get('type'):
            return jsonify({"error": "Title and type are required"}), 400

        new_offer = Offer(
            title=data.get('title'),
            description=data.get('description'),
            type=data.get('type'),
            target_type=data.get('target_type', 'all'),
            target_id=data.get('target_id'),
            discount_type=data.get('discount_type'),
            discount_value=data.get('discount_value'),
            priority=data.get('priority', 'Medium'),
            start_date=data.get('start_date'),
            start_time=data.get('start_time'),
            end_date=data.get('end_date'),
            end_time=data.get('end_time'),
            display_locations=data.get('display_locations', []),
            featured_products=data.get('featured_products', []),
            image_url=data.get('image_url'),
            popup_image_url=data.get('popup_image_url'),
            thumbnail_image_url=data.get('thumbnail_image_url'),
            status=data.get('status', 'Active')
        )
        db.session.add(new_offer)
        db.session.commit()
        emit_update('offer_updated', {'action': 'create', 'offer': new_offer.to_dict()})
        return jsonify(new_offer.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Admin: Update offer
@offers_bp.route('/<int:offer_id>', methods=['PUT'])
def update_offer(offer_id):
    try:
        offer = Offer.query.get(offer_id)
        if not offer:
            return jsonify({"error": "Offer not found"}), 404

        data = request.json
        
        if 'title' in data: offer.title = data['title']
        if 'description' in data: offer.description = data['description']
        if 'type' in data: offer.type = data['type']
        if 'target_type' in data: offer.target_type = data['target_type']
        if 'target_id' in data: offer.target_id = data['target_id']
        if 'discount_type' in data: offer.discount_type = data['discount_type']
        if 'discount_value' in data: offer.discount_value = data['discount_value']
        
        if 'priority' in data: offer.priority = data['priority']
        if 'start_time' in data: offer.start_time = data['start_time']
        if 'end_time' in data: offer.end_time = data['end_time']
        if 'featured_products' in data: offer.featured_products = data['featured_products']
        if 'popup_image_url' in data: offer.popup_image_url = data['popup_image_url']
        if 'thumbnail_image_url' in data: offer.thumbnail_image_url = data['thumbnail_image_url']
        
        if 'start_date' in data: offer.start_date = data['start_date']
        if 'end_date' in data: offer.end_date = data['end_date']
        if 'display_locations' in data: offer.display_locations = data['display_locations']
        if 'image_url' in data: offer.image_url = data['image_url']
        if 'status' in data: offer.status = data['status']

        db.session.commit()
        emit_update('offer_updated', {'action': 'update', 'offer': offer.to_dict()})
        return jsonify(offer.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Admin: Delete offer
@offers_bp.route('/<int:offer_id>', methods=['DELETE'])
def delete_offer(offer_id):
    try:
        offer = Offer.query.get(offer_id)
        if not offer:
            return jsonify({"error": "Offer not found"}), 404

        db.session.delete(offer)
        db.session.commit()
        emit_update('offer_updated', {'action': 'delete', 'offer_id': offer_id})
        return jsonify({"message": "Offer deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
