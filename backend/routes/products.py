from flask import Blueprint, request, jsonify
from database.db import db
from database.models import Product, BatterProduct, WebsiteActivity
from routes.auth import check_admin_auth
from datetime import datetime

products_bp = Blueprint('products', __name__)

@products_bp.route('/', methods=['GET'])
def get_products():
    category = request.args.get('category')
    search = request.args.get('search')
    page = request.args.get('page', type=int)
    limit = request.args.get('limit', type=int)

    # Check cache first
    cache_key = f"products_{category}_{search}_{page}_{limit}"
    from app import get_cached_data, set_cached_data
    cached = get_cached_data(cache_key)
    if cached is not None:
        results, total_count, total_pages = cached
        res = jsonify(results)
        res.headers['X-Total-Count'] = str(total_count)
        res.headers['X-Total-Pages'] = str(total_pages)
        if page:
            res.headers['X-Current-Page'] = str(page)
        if limit:
            res.headers['X-Limit'] = str(limit)
        return res, 200

    query = Product.query
    if category and category.lower() != 'all':
        db_category = category.replace('-', '_')
        if db_category == 'batter_products':
            # Include all batter sub-categories
            query = query.filter(Product.category.in_(['traditional', 'millet', 'health', 'family_packs', 'premium', 'subscription', 'batter_products']))
        else:
            # Support both hyphenated and underscore formats
            query = query.filter(Product.category.in_([db_category, category]))

    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))

    if page and limit:
        # Use SQLAlchemy pagination
        pagination = query.paginate(page=page, per_page=limit, error_out=False)
        products = pagination.items
        total_count = pagination.total
        total_pages = pagination.pages
    else:
        products = query.all()
        total_count = len(products)
        total_pages = 1

    # Map back to old mock fields to preserve frontend compatibility
    results = []
    for p in products:
        results.append({
            "id": p.id,
            "name": p.name,
            "description": p.description or '',
            "price": p.price,
            "offer_price": p.offer_price,
            "category": p.category.replace('_', '-'),  # match 'batter-products'
            "image": p.image or '/assets/images/placeholder.jpg',
            "in_stock": p.stock > 0 if p.stock is not None else p.is_available,
            "stock_count": p.stock or 0,
            "unit": "1kg Pouch" if "batter" in p.name.lower() else "Plate",
            "type": getattr(p, 'diet_type', 'Veg'),
            "diet_type": getattr(p, 'diet_type', 'Veg')
        })
        
    set_cached_data(cache_key, (results, total_count, total_pages), ttl_seconds=15)
    res = jsonify(results)
    res.headers['X-Total-Count'] = str(total_count)
    res.headers['X-Total-Pages'] = str(total_pages)
    if page:
        res.headers['X-Current-Page'] = str(page)
    if limit:
        res.headers['X-Limit'] = str(limit)
    return res, 200

@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    p = Product.query.get(product_id)
    if p:
        return jsonify({
            "id": p.id,
            "name": p.name,
            "description": p.description or '',
            "price": p.price,
            "offer_price": p.offer_price,
            "category": p.category.replace('_', '-'),
            "image": p.image or '/assets/images/placeholder.jpg',
            "in_stock": p.stock > 0 if p.stock is not None else p.is_available,
            "stock_count": p.stock or 0,
            "unit": "1kg Pouch" if "batter" in p.name.lower() else "Plate",
            "type": getattr(p, 'diet_type', 'Veg'),
            "diet_type": getattr(p, 'diet_type', 'Veg')
        }), 200
    return jsonify({"error": "Product not found"}), 404

@products_bp.route('/', methods=['POST'])
def create_product():
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json() or {}
    name = data.get('name')
    price = data.get('price')
    category = data.get('category', '').replace('-', '_')

    if not name or price is None or not category:
        return jsonify({"error": "Name, price, and category are required"}), 400

    new_prod = Product(
        name=name,
        description=data.get('description', ''),
        price=float(price),
        offer_price=float(data.get('offer_price')) if data.get('offer_price') is not None else None,
        category=category,
        image=data.get('image', '/assets/images/placeholder.jpg'),
        stock=int(data.get('stock_count') or data.get('stock') or 10),
        is_available=bool(data.get('in_stock', True)),
        diet_type=data.get('diet_type') or data.get('type') or 'Veg'
    )
    db.session.add(new_prod)
    db.session.commit()
    
    return jsonify({
        "message": "Product created successfully",
        "product": {
            "id": new_prod.id,
            "name": new_prod.name,
            "price": new_prod.price,
            "category": new_prod.category
        }
    }), 201

@products_bp.route('/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403

    p = Product.query.get(product_id)
    if not p:
        return jsonify({"error": "Product not found"}), 404

    data = request.get_json() or {}
    p.name = data.get('name', p.name)
    p.description = data.get('description', p.description)
    if 'price' in data:
        p.price = float(data['price'])
    if 'offer_price' in data:
        p.offer_price = float(data['offer_price']) if data['offer_price'] is not None else None
    if 'category' in data:
        p.category = data['category'].replace('-', '_')
    p.image = data.get('image', p.image)
    if 'in_stock' in data:
        p.is_available = bool(data['in_stock'])
    if 'stock_count' in data or 'stock' in data:
        p.stock = int(data.get('stock_count') or data.get('stock'))
    if 'diet_type' in data or 'type' in data:
        p.diet_type = data.get('diet_type') or data.get('type')

    db.session.commit()
    return jsonify({
        "message": "Product updated successfully",
        "product": {
            "id": p.id,
            "name": p.name,
            "price": p.price
        }
    }), 200

@products_bp.route('/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403

    p = Product.query.get(product_id)
    if not p:
        return jsonify({"error": "Product not found"}), 404

    db.session.delete(p)
    db.session.commit()
    return jsonify({"message": "Product deleted successfully"}), 200

# File Upload Endpoint
import os
from flask import current_app
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'svg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@products_bp.route('/upload', methods=['POST'])
def upload_product_image():
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403

    if 'file' not in request.files:
        return jsonify({"error": "No file part in request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        base_name = os.path.splitext(secure_filename(file.filename))[0]
        filename = f"prod_{int(datetime.utcnow().timestamp())}_{base_name}.webp"
        upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        
        try:
            from PIL import Image
            img = Image.open(file)
            if img.width > 1000:
                ratio = 1000.0 / img.width
                new_size = (1000, int(img.height * ratio))
                img = img.resize(new_size, Image.Resampling.LANCZOS)
            img.save(upload_path, 'WEBP', quality=85)
        except Exception:
            file.seek(0)
            file.save(upload_path)

        # Serve static URL
        image_url = f"http://localhost:5000/uploads/{filename}"
        return jsonify({
            "message": "Image uploaded and compressed successfully",
            "image_url": image_url
        }), 200

    return jsonify({"error": "File extension not allowed"}), 400

# Batter Product Variant CRUD
from datetime import datetime

@products_bp.route('/batter-variants', methods=['GET'])
def get_batter_variants():
    variants = BatterProduct.query.all()
    return jsonify([v.to_dict() for v in variants]), 200

@products_bp.route('/batter-variants/<int:variant_id>', methods=['GET'])
def get_batter_variant(variant_id):
    v = BatterProduct.query.get(variant_id)
    if not v:
        return jsonify({"error": "Batter variant not found"}), 404
    return jsonify(v.to_dict()), 200

@products_bp.route('/batter-variants', methods=['POST'])
def create_batter_variant():
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json() or {}
    product_name = data.get('product_name')
    price = data.get('price')
    variant = data.get('variant')  # e.g., '1kg Pack'
    weight = data.get('weight')    # e.g., '1kg'

    if not product_name or price is None:
        return jsonify({"error": "product_name and price are required"}), 400

    new_var = BatterProduct(
        product_name=product_name,
        variant=variant or 'Standard Pack',
        weight=weight or '1kg',
        price=float(price),
        offer_price=float(data.get('offer_price')) if data.get('offer_price') is not None else None,
        stock=int(data.get('stock') or data.get('stock_count') or 0),
        expiry_date=data.get('expiry_date', ''),
        manufacture_date=data.get('manufacture_date', ''),
        image=data.get('image', '/assets/images/placeholder.jpg')
    )
    db.session.add(new_var)
    db.session.commit()

    return jsonify({
        "message": "Batter variant created successfully",
        "variant": new_var.to_dict()
    }), 201

@products_bp.route('/batter-variants/<int:variant_id>', methods=['PUT'])
def update_batter_variant(variant_id):
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403

    v = BatterProduct.query.get(variant_id)
    if not v:
        return jsonify({"error": "Batter variant not found"}), 404

    data = request.get_json() or {}
    v.product_name = data.get('product_name', v.product_name)
    v.variant = data.get('variant', v.variant)
    v.weight = data.get('weight', v.weight)
    if 'price' in data:
        v.price = float(data['price'])
    if 'offer_price' in data:
        v.offer_price = float(data['offer_price']) if data['offer_price'] is not None else None
    if 'stock' in data or 'stock_count' in data:
        v.stock = int(data.get('stock') or data.get('stock_count'))
    v.expiry_date = data.get('expiry_date', v.expiry_date)
    v.manufacture_date = data.get('manufacture_date', v.manufacture_date)
    v.image = data.get('image', v.image)

    db.session.commit()
    return jsonify({
        "message": "Batter variant updated successfully",
        "variant": v.to_dict()
    }), 200

@products_bp.route('/batter-variants/<int:variant_id>', methods=['DELETE'])
def delete_batter_variant(variant_id):
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403

    v = BatterProduct.query.get(variant_id)
    if not v:
        return jsonify({"error": "Batter variant not found"}), 404

    db.session.delete(v)
    db.session.commit()
    return jsonify({"message": "Batter variant deleted successfully"}), 200


@products_bp.route('/track-activity', methods=['POST'])
def track_activity():
    data = request.get_json() or {}
    activity_type = data.get('activity_type')
    product_id = data.get('product_id')
    ip_address = data.get('ip_address') or request.remote_addr or '127.0.0.1'

    if not activity_type:
        return jsonify({"error": "activity_type is required"}), 400

    new_activity = WebsiteActivity(
        ip_address=ip_address,
        activity_type=activity_type,
        product_id=product_id
    )
    db.session.add(new_activity)
    db.session.commit()

    return jsonify({
        "message": "Activity tracked successfully",
        "activity": new_activity.to_dict()
    }), 201


@products_bp.route('/media', methods=['GET'])
def get_media_files():
    from flask import current_app
    upload_folder = current_app.config['UPLOAD_FOLDER']
    if not os.path.exists(upload_folder):
        return jsonify([]), 200
    files = []
    for f in os.listdir(upload_folder):
        if os.path.isfile(os.path.join(upload_folder, f)) and f != '.gitkeep':
            files.append({
                "name": f,
                "url": f"http://localhost:5000/uploads/{f}"
            })
    return jsonify(files), 200

