from flask import Blueprint, request, jsonify
from database.db import db
from database.models import HomepageConfig, User
from functools import wraps
import jwt
from config import Config

homepage_bp = Blueprint('homepage', __name__)

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        
        if not token:
            return jsonify({"message": "Token is missing"}), 401
            
        try:
            data = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
            user = User.query.get(data['user_id'])
            if not user or user.role != 'admin':
                return jsonify({"message": "Admin privileges required"}), 403
        except Exception as e:
            return jsonify({"message": "Token is invalid"}), 401
            
        return f(*args, **kwargs)
    return decorated

@homepage_bp.route('/', methods=['GET'])
def get_homepage_config():
    config = HomepageConfig.query.first()
    if not config:
        return jsonify({"message": "Homepage configuration not found"}), 404
    return jsonify(config.to_dict()), 200

@homepage_bp.route('/', methods=['PUT'])
@admin_required
def update_homepage_config():
    data = request.json
    config = HomepageConfig.query.first()
    
    if not config:
        config = HomepageConfig()
        db.session.add(config)
        
    if 'hero_banner' in data:
        config.hero_banner = data['hero_banner']
    if 'kitchen_pulse' in data:
        config.kitchen_pulse = data['kitchen_pulse']
    if 'trending_today' in data:
        config.trending_today = data['trending_today']
    if 'festivals' in data:
        config.festivals = data['festivals']
    if 'amma_recommends' in data:
        config.amma_recommends = data['amma_recommends']
        
    db.session.commit()
    
    return jsonify({"message": "Homepage configuration updated successfully", "config": config.to_dict()}), 200

@homepage_bp.route('/seed', methods=['POST'])
def seed_homepage_config():
    config = HomepageConfig.query.first()
    if config:
        return jsonify({"message": "Configuration already exists", "config": config.to_dict()}), 200
        
    default_config = HomepageConfig(
        hero_banner={
            "title": "Today's Kitchen Is Ready",
            "subtitle": "Fresh Dosa Batter & Hot Meals Available",
            "special_tag": "Today's Special",
            "special_title": "Signature Mini Tiffin Combo",
            "bg_image": "/assets/Food images/Veg/South Indian.webp"
        },
        kitchen_pulse={
            "most_ordered": {"name": "Ghee Roast Dosa", "price": 120, "img": "/assets/Food images/Veg/Ghee Roast Dosa.webp"},
            "customer_favorite": {"name": "Edli Sambar", "price": 90, "img": "/assets/Food images/Veg/Edli Sambar.webp"},
            "chef_recommendation": {"name": "Medu Vada", "price": 60, "img": "/assets/Food images/Veg/Medu Vada.webp"},
            "trending_product": {"name": "Idli Batter", "price": 80, "img": "/assets/Food images/Batters/Idli Batter.webp"},
            "todays_offer": {"name": "Pongal Combo", "price": 150, "img": "/assets/Food images/Veg/Ven Pongal.webp"},
            "seasonal_special": {"name": "Keema Samosa", "price": 70, "img": "/assets/Food images/Veg/Keema Samosa.webp"}
        },
        trending_today=[
            {"name": "Masala Dosa", "price": 90, "img": "/assets/Food images/Veg/Onion Dosa.webp"},
            {"name": "Paneer Biryani", "price": 220, "img": "/assets/Food images/Non-veg/Hyderabad Dum Biriyani.webp"},
            {"name": "Ragi Batter", "price": 95, "img": "/assets/Food images/Batters/Appam Batter.webp"},
            {"name": "Mini Tiffin", "price": 130, "img": "/assets/Food images/Veg/Edli Vada.webp"}
        ],
        festivals={
            "tag": "Upcoming",
            "title": "Tamil New Year Special",
            "description": "Pre-order the festive feast combo starting next week.",
            "bg_image": "/assets/Food images/Veg/Veg Meals.webp",
            "btn_text": "Preview Menu",
            "is_active": True
        },
        amma_recommends={
            "breakfast_title": "Popular Today in your area",
            "lunch_title": "Based on your previous orders",
            "dinner_title": "Light & Freshly Prepared"
        }
    )
    
    db.session.add(default_config)
    db.session.commit()
    
    return jsonify({"message": "Homepage config seeded successfully", "config": default_config.to_dict()}), 201
