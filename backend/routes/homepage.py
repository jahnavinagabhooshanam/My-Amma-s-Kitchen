from flask import Blueprint, request, jsonify
from database.db import db
from database.models import HomepageConfig, User
from functools import wraps
import jwt
from config import Config
from routes.auth import check_admin_auth

homepage_bp = Blueprint('homepage', __name__)

DEFAULT_HOMEPAGE_CONFIG = {
    "hero_banner": {
        "title": "Today's Kitchen Is Ready",
        "subtitle": "Fresh dosa batter, homestyle meals, and warm tiffin favorites are ready now.",
        "special_tag": "Today's Special",
        "special_title": "Signature Mini Tiffin Combo",
        "bg_image": "/assets/Food images/Veg/South Indian.webp"
    },
    "kitchen_pulse": {
        "most_ordered": {"name": "Ghee Roast Dosa", "price": 120, "img": "/assets/Food images/Veg/Ghee Roast Dosa.webp"},
        "customer_favorite": {"name": "Idli Sambar", "price": 90, "img": "/assets/Food images/Veg/Edli Sambar.webp"},
        "chef_recommendation": {"name": "Medu Vada", "price": 60, "img": "/assets/Food images/Veg/Medu Vada.webp"},
        "trending_product": {"name": "Idli Batter", "price": 80, "img": "/assets/Food images/Batters/Idli Batter.webp"},
        "todays_offer": {"name": "Pongal Combo", "price": 150, "img": "/assets/Food images/Veg/Ven Pongal.webp"},
        "seasonal_special": {"name": "Veg Meals", "price": 180, "img": "/assets/Food images/Veg/Veg Meals.webp"}
    },
    "trending_today": [
        {"name": "Onion Dosa", "price": 110, "img": "/assets/Food images/Veg/Onion Dosa.webp"},
        {"name": "Hyderabad Dum Biryani", "price": 260, "img": "/assets/Food images/Non-veg/Hyderabad Dum Biriyani.webp"},
        {"name": "Appam Batter", "price": 90, "img": "/assets/Food images/Batters/Appam Batter.webp"},
        {"name": "Idli Vada", "price": 110, "img": "/assets/Food images/Veg/Edli Vada.webp"}
    ],
    "festivals": {
        "tag": "Upcoming",
        "title": "Tamil New Year Special",
        "description": "Pre-order the festive feast combo starting next week.",
        "bg_image": "/assets/Food images/Veg/Veg Meals.webp",
        "btn_text": "Preview Menu",
        "is_active": True
    },
    "amma_recommends": [
        {"name": "Ghee Roast Dosa", "price": 130, "img": "/assets/Food images/Veg/Ghee Roast Dosa.webp"},
        {"name": "Idli Sambar", "price": 90, "img": "/assets/Food images/Veg/Edli Sambar.webp"},
        {"name": "Poori Dhal", "price": 100, "img": "/assets/Food images/Veg/Poori Dhal.webp"},
        {"name": "Paneer Butter Masala", "price": 220, "img": "/assets/Food images/Veg/Paneer Pasanda.webp"}
    ]
}

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not check_admin_auth(auth_header):
            return jsonify({"message": "Admin privileges required or Token is invalid"}), 401
            
        return f(*args, **kwargs)
    return decorated

@homepage_bp.route('/', methods=['GET'])
def get_homepage_config():
    cache_key = "homepage_config_data"
    from app import get_cached_data, set_cached_data
    cached = get_cached_data(cache_key)
    if cached is not None:
        return jsonify(cached), 200

    config = HomepageConfig.query.first()
    if not config:
        return jsonify(DEFAULT_HOMEPAGE_CONFIG), 200
        
    result = config.to_dict()
    set_cached_data(cache_key, result, ttl_seconds=60)
    return jsonify(result), 200

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
    
    from app import clear_cache
    clear_cache("homepage_config_data")
    
    return jsonify({"message": "Homepage configuration updated successfully", "config": config.to_dict()}), 200

@homepage_bp.route('/seed', methods=['POST'])
def seed_homepage_config():
    config = HomepageConfig.query.first()
    if config:
        return jsonify({"message": "Configuration already exists", "config": config.to_dict()}), 200
        
    default_config = HomepageConfig(**DEFAULT_HOMEPAGE_CONFIG)
    
    db.session.add(default_config)
    db.session.commit()
    
    return jsonify({"message": "Homepage config seeded successfully", "config": default_config.to_dict()}), 201
