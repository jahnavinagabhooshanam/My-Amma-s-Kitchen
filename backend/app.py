import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from config import Config
from database.db import db, migrate

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)
app.url_map.strict_slashes = False

# Enable CORS for frontend interactions
CORS(app, resources={r"/*": {
    "origins": "*",
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Headers", "X-Requested-With"],
    "expose_headers": ["X-Total-Count", "X-Total-Pages", "X-Current-Page", "X-Limit"]
}})

@app.after_request
def apply_caching_and_security(response):
    # Security Headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Initialize database and migrations
db.init_app(app)
migrate.init_app(app, db)

# Initialize SocketIO
from sockets import socketio
socketio.init_app(app)

# Import models to ensure they are registered for migrations
from database.models import User, Product, BatterProduct, Order, OrderItem, CartItem, BulkOrder, Review, Coupon, Inventory, BatterProduction, DeliveryPartner, WebsiteActivity, KitchenStaff, HomepageConfig, Notification, Offer, RolePermission, SavedForLater

# Create upload folder if it doesn't exist
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Import Blueprints
from routes.auth import auth_bp
from routes.products import products_bp
from routes.orders import orders_bp
from routes.customers import customers_bp
from routes.inventory import inventory_bp
from routes.bulk_orders import bulk_orders_bp
from routes.cart import cart_bp
from routes.reviews import reviews_bp
from routes.coupons import coupons_bp
from routes.admin import admin_bp
from routes.batter_production import batter_production_bp
from routes.delivery_management import delivery_management_bp
from routes.user_management import user_management_bp
from routes.kitchen_management import kitchen_management_bp
from routes.homepage import homepage_bp
from routes.addresses import addresses_bp
from routes.wishlist import wishlist_bp
from routes.contact import contact_bp
from routes.notifications import notifications_bp
from routes.offers import offers_bp
from routes.saved_for_later import saved_for_later_bp
from routes.sitemap import sitemap_bp

# Register Blueprints under standard prefix /api
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(products_bp, url_prefix='/api/products')
app.register_blueprint(orders_bp, url_prefix='/api/orders')
app.register_blueprint(customers_bp, url_prefix='/api/customers')
app.register_blueprint(inventory_bp, url_prefix='/api/inventory')
app.register_blueprint(bulk_orders_bp, url_prefix='/api/bulk_orders')
app.register_blueprint(cart_bp, url_prefix='/api/cart')
app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
app.register_blueprint(coupons_bp, url_prefix='/api/coupons')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(batter_production_bp, url_prefix='/api/batter-production')
app.register_blueprint(delivery_management_bp, url_prefix='/api/delivery-management')
app.register_blueprint(user_management_bp, url_prefix='/api/user-management')
app.register_blueprint(kitchen_management_bp, url_prefix='/api/kitchen-management')
app.register_blueprint(homepage_bp, url_prefix='/api/homepage')
app.register_blueprint(addresses_bp, url_prefix='/api/addresses')
app.register_blueprint(wishlist_bp, url_prefix='/api/wishlist')
app.register_blueprint(contact_bp, url_prefix='/api/contact')
app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
app.register_blueprint(offers_bp, url_prefix='/api/offers')
app.register_blueprint(saved_for_later_bp, url_prefix='/api/saved_for_later')
app.register_blueprint(sitemap_bp, url_prefix='/')

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "message": "Hotel Ammulu's Kitchen API is fully operational",
        "database": "MySQL (Connected)"
    }), 200

from flask import send_from_directory
@app.route('/uploads/<path:filename>')
@app.route('/api/uploads/<path:filename>')
def serve_upload(filename):
    upload_folder = app.config['UPLOAD_FOLDER']
    full_path = os.path.join(upload_folder, filename)
    if os.path.exists(full_path):
        return send_from_directory(upload_folder, filename, max_age=31536000)
    base, ext = os.path.splitext(filename)
    if ext.lower() in ['.jpg', '.jpeg', '.png']:
        webp_filename = base + '.webp'
        if os.path.exists(os.path.join(upload_folder, webp_filename)):
            return send_from_directory(upload_folder, webp_filename, max_age=31536000)
    return send_from_directory(upload_folder, filename, max_age=31536000)

@app.route('/assets/<path:filename>')
@app.route('/api/assets/<path:filename>')
def serve_assets(filename):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    admin_assets_dir = os.path.join(base_dir, '..', 'admin', 'src', 'assets')
    full_path = os.path.join(admin_assets_dir, filename)
    if os.path.exists(full_path):
        return send_from_directory(admin_assets_dir, filename, max_age=31536000)
    base, ext = os.path.splitext(filename)
    if ext.lower() in ['.jpg', '.jpeg', '.png']:
        webp_filename = base + '.webp'
        if os.path.exists(os.path.join(admin_assets_dir, webp_filename)):
            return send_from_directory(admin_assets_dir, webp_filename, max_age=31536000)
    return send_from_directory(admin_assets_dir, filename, max_age=31536000)

# Cache System
APP_CACHE = {}

def get_cached_data(key):
    import time
    if key in APP_CACHE:
        expiry, data = APP_CACHE[key]
        if time.time() < expiry:
            return data
    return None

def set_cached_data(key, data, ttl_seconds=15):
    import time
    expiry = time.time() + ttl_seconds
    APP_CACHE[key] = (expiry, data)

def clear_cache(key=None):
    if key:
        APP_CACHE.pop(key, None)
    else:
        APP_CACHE.clear()

# Rate Limiting Store
from collections import defaultdict
import time
IP_REQUESTS = defaultdict(list)
RATE_LIMIT_WINDOW = 60 # 1 minute
RATE_LIMIT_MAX = 300   # 300 requests per minute

@app.before_request
def rate_limiter():
    # Bypass health checks and local asset fetching to allow normal rendering
    if request.path == '/api/health' or '/assets/' in request.path or '/uploads/' in request.path:
        return
    ip = request.remote_addr or '127.0.0.1'
    now = time.time()
    IP_REQUESTS[ip] = [t for t in IP_REQUESTS[ip] if now - t < RATE_LIMIT_WINDOW]
    if len(IP_REQUESTS[ip]) >= RATE_LIMIT_MAX:
        return jsonify({"error": "Too many requests. Please try again in a minute.", "code": 429}), 429
    IP_REQUESTS[ip].append(now)

# Security Headers and Response Compression
import gzip
import io

@app.after_request
def add_security_headers_and_compress(response):
    # Apply security headers
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Referrer-Policy'] = 'no-referrer-when-downgrade'
    # Ensure CORS headers are always present (helps when other handlers return errors)
    response.headers.setdefault('Access-Control-Allow-Origin', '*')
    response.headers.setdefault('Access-Control-Allow-Headers', 'Content-Type, Authorization, Access-Control-Allow-Headers, X-Requested-With')
    response.headers.setdefault('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
    
    # Check if compression is applicable
    content_type = response.headers.get('Content-Type', '')
    if 'text' not in content_type and 'json' not in content_type and 'javascript' not in content_type and 'css' not in content_type:
        return response

    accept_encoding = request.headers.get('Accept-Encoding', '')
    if 'gzip' not in accept_encoding.lower():
        return response

    if response.headers.get('Content-Encoding'):
        return response

    # Perform compression
    try:
        gzip_buffer = io.BytesIO()
        gzip_file = gzip.GzipFile(mode='wb', fileobj=gzip_buffer)
        gzip_file.write(response.get_data())
        gzip_file.close()
        response.set_data(gzip_buffer.getvalue())
        response.headers['Content-Encoding'] = 'gzip'
        response.headers['Content-Length'] = len(response.get_data())
    except Exception:
        pass
    # Handle preflight OPTIONS gracefully (some proxies/browsers expect 200)
    if request.method == 'OPTIONS':
        response.status_code = 200

    return response

# Global Error Handlers
@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"error": "Resource not found", "code": 404}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error", "code": 500}), 500

if __name__ == '__main__':
    # Start the server
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)
