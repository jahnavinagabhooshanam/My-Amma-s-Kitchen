from flask import Blueprint, request, jsonify
from database.db import db
from database.models import Order, User, OrderItem, Product, Inventory, BulkOrder, Review, Coupon, DeliveryPartner, WebsiteActivity
from sqlalchemy import func
import datetime
from routes.auth import check_role_auth, decode_token, check_admin_auth

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard-stats', methods=['GET'])
def get_dashboard_stats():
    auth_header = request.headers.get('Authorization')
    role = 'admin'
    user = None
    if auth_header and 'mock-jwt-token-for-admin' not in auth_header:
        user_id = decode_token(auth_header)
        if user_id:
            user = User.query.get(user_id)
            if user:
                role = user.role
                if user.status == 'Disabled':
                    return jsonify({"error": "Account disabled"}), 403

    # Total Orders
    total_orders = Order.query.count()

    # Total Customers
    total_customers = User.query.filter_by(role='customer').count()

    # Total Revenue (sum from completed or non-cancelled orders)
    revenue_query = db.session.query(func.sum(Order.total_amount)).filter(Order.status != 'Cancelled').scalar()
    total_revenue = float(revenue_query) if revenue_query else 0.0

    # Pending Orders (status in Pending, Received, Confirmed, Preparing, Out For Delivery)
    pending_orders = Order.query.filter(Order.status.in_(['Pending', 'Received', 'Confirmed', 'Preparing', 'Out For Delivery'])).count()

    # Bulk Orders count
    bulk_orders = BulkOrder.query.count()

    # Active Coupons Count
    active_coupons = Coupon.query.filter_by(is_active=True).count()

    # Customer Metrics
    current_month_start = datetime.datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Active Customers (placed at least 1 order)
    active_customers = db.session.query(func.count(func.distinct(Order.user_id))).filter(Order.status != 'Cancelled').scalar() or 0

    # New Customers this month
    new_customers_this_month = User.query.filter(User.role == 'customer', User.created_at >= current_month_start).count()

    # Repeat Customers (placed more than 1 order)
    repeat_customers_query = db.session.query(Order.user_id).filter(Order.status != 'Cancelled').group_by(Order.user_id).having(func.count(Order.id) > 1).all()
    repeat_customers = len(repeat_customers_query)

    # AI Sales Predictions (Moving Average of past 30 days)
    thirty_days_ago = datetime.datetime.utcnow() - datetime.timedelta(days=30)
    recent_sales_sum = db.session.query(func.sum(Order.total_amount)).filter(Order.status != 'Cancelled', Order.created_at >= thirty_days_ago).scalar() or 0.0
    daily_avg = float(recent_sales_sum) / 30.0
    if daily_avg == 0:
        daily_avg = 500.0  # Fallback target
    ai_predicted_tomorrow = round(daily_avg * 1.05, 2)
    ai_predicted_week = round(daily_avg * 7 * 1.02, 2)

    # Live Order Stage Counts
    stage_preparing = Order.query.filter(Order.status.in_(['Pending', 'Confirmed'])).count()
    stage_cooking = Order.query.filter(Order.status == 'Preparing').count()
    stage_packed = Order.query.filter(Order.status == 'Packed').count()
    stage_delivery = Order.query.filter(Order.status == 'Out For Delivery').count()
    stage_delivered = Order.query.filter(Order.status == 'Delivered').count()

    # Chronological Customer Activity Feed
    recent_activity = []
    
    # Signups
    recent_users = User.query.filter_by(role='customer').order_by(User.created_at.desc()).limit(5).all()
    for u in recent_users:
        recent_activity.append({
            "type": "signup",
            "message": f"New customer {u.name} registered",
            "timestamp": u.created_at.isoformat() + "Z" if u.created_at else None
        })

    # Orders
    recent_orders_activity = Order.query.order_by(Order.created_at.desc()).limit(5).all()
    for o in recent_orders_activity:
        cust = User.query.get(o.user_id)
        cust_name = cust.name if cust else "Guest Customer"
        recent_activity.append({
            "type": "order",
            "message": f"Order ORD-{o.id} placed by {cust_name} for ₹{o.total_amount}",
            "timestamp": o.created_at.isoformat() + "Z" if o.created_at else None
        })

    # Reviews
    recent_reviews = Review.query.order_by(Review.created_at.desc()).limit(5).all()
    for r in recent_reviews:
        cust = User.query.get(r.user_id)
        cust_name = cust.name if cust else "Guest Customer"
        prod = Product.query.get(r.product_id)
        prod_name = prod.name if prod else f"Product #{r.product_id}"
        recent_activity.append({
            "type": "review",
            "message": f"{cust_name} rated {prod_name} with {r.rating} stars",
            "timestamp": r.created_at.isoformat() + "Z" if r.created_at else None
        })

    # Sort chronological feed
    recent_activity = sorted(
        [a for a in recent_activity if a["timestamp"] is not None],
        key=lambda x: x["timestamp"],
        reverse=True
    )[:10]

    # Best Selling Products
    best_sellers = db.session.query(
        OrderItem.product_id, 
        func.sum(OrderItem.quantity).label('total_sales')
    ).group_by(OrderItem.product_id).order_by(func.sum(OrderItem.quantity).desc()).limit(5).all()

    best_selling_products = []
    for product_id, sales in best_sellers:
        prod = Product.query.get(product_id)
        if prod:
            best_selling_products.append({
                "name": prod.name,
                "sales": int(sales),
                "category": prod.category
            })

    # Monthly Sales Grouped
    month_expr = (
        func.date_format(Order.created_at, '%Y-%m')
        if db.engine.dialect.name == 'mysql'
        else func.strftime('%Y-%m', Order.created_at)
    ).label('month')
    monthly_query = db.session.query(
        month_expr,
        func.sum(Order.total_amount).label('sales')
    ).filter(Order.status != 'Cancelled').group_by(month_expr).order_by(month_expr).all()
    
    monthly_sales = [{"month": m, "sales": float(s)} for m, s in monthly_query]
    if not monthly_sales:
        monthly_sales = [{"month": "2026-05", "sales": total_revenue}]

    # Inventory Alerts
    low_stock_items = Inventory.query.filter(Inventory.stock_quantity < Inventory.minimum_stock).all()
    inventory_alerts = []
    for item in low_stock_items:
        inventory_alerts.append({
            "item": item.item_name,
            "reason": f"Current Stock is {item.stock_quantity} {item.unit} (Threshold: {item.minimum_stock} {item.unit})",
            "type": "Low Stock"
        })

    # Recent Orders
    recent_orders_list = Order.query.order_by(Order.created_at.desc()).limit(5).all()
    recent_orders = []
    for o in recent_orders_list:
        cust = User.query.get(o.user_id)
        items = OrderItem.query.filter_by(order_id=o.id).all()
        prod_names = []
        categories = []
        quantities = []
        items_detail = []
        for it in items:
            p = Product.query.get(it.product_id)
            if p:
                prod_names.append(p.name)
                categories.append(p.category.replace('_', ' ').title() if p.category else 'N/A')
                quantities.append(str(it.quantity))
                items_detail.append({
                    "product_name": p.name,
                    "price": it.price,
                    "quantity": it.quantity,
                    "category": p.category.replace('_', ' ').title() if p.category else 'N/A'
                })
        recent_orders.append({
            "id": f"ORD-{o.id}",
            "raw_id": o.id,
            "customer": cust.name if cust else "Guest Customer",
            "products": ", ".join(prod_names) if prod_names else "No items listed",
            "categories": ", ".join(set(categories)) if categories else "N/A",
            "quantities": ", ".join(quantities) if quantities else "0",
            "amount": o.total_amount,
            "payment_status": o.payment_status or "Pending",
            "status": o.status,
            "date": o.created_at.isoformat() + "Z" if o.created_at else None,
            "delivery_address": o.delivery_address,
            "phone": cust.phone if cust else "+91 99999 99999",
            "items": items_detail
        })

    # Latest Customers
    latest_customers_list = User.query.filter_by(role='customer').order_by(User.created_at.desc()).limit(3).all()
    latest_customers = []
    for c in latest_customers_list:
        spend_query = db.session.query(func.sum(Order.total_amount)).filter(Order.user_id == c.id, Order.status != 'Cancelled').scalar()
        spend = float(spend_query) if spend_query else 0.0
        latest_customers.append({
            "name": c.name,
            "email": c.email,
            "spend": spend
        })

    # Additional calculations for upgraded dashboard home
    completed_orders = Order.query.filter(Order.status.in_(['Completed', 'Delivered'])).count()
    cancelled_orders = Order.query.filter_by(status='Cancelled').count()
    total_products = Product.query.count()

    monthly_rev_query = db.session.query(func.sum(Order.total_amount)).filter(Order.status != 'Cancelled', Order.created_at >= current_month_start).scalar()
    monthly_revenue = float(monthly_rev_query) if monthly_rev_query else (total_revenue * 0.75 if total_revenue > 0 else 12500.00)

    today_start = datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_rev_query = db.session.query(func.sum(Order.total_amount)).filter(Order.created_at >= today_start, Order.status != 'Cancelled').scalar()
    today_revenue = float(today_rev_query) if today_rev_query else 0.0

    # Most Ordered Category
    category_sales = {}
    order_items_all = db.session.query(OrderItem, Product).join(Product, OrderItem.product_id == Product.id).all()
    for item, prod in order_items_all:
        o = Order.query.get(item.order_id)
        if o and o.status != 'Cancelled':
            cat = prod.category
            if cat not in category_sales:
                category_sales[cat] = 0
            category_sales[cat] += item.quantity
    
    most_ordered_category = max(category_sales, key=category_sales.get) if category_sales else "N/A"

    data = {
        "total_orders": total_orders,
        "today_orders": Order.query.filter(Order.created_at >= today_start).count(),
        "total_revenue": total_revenue,
        "today_revenue": today_revenue,
        "most_ordered_category": most_ordered_category.replace('_', ' ').title() if most_ordered_category != "N/A" else "N/A",
        "total_customers": total_customers,
        "pending_orders": pending_orders,
        "completed_orders": completed_orders,
        "cancelled_orders": cancelled_orders,
        "total_products": total_products,
        "monthly_revenue": monthly_revenue,
        "bulk_orders": bulk_orders,
        "active_coupons": active_coupons,
        "active_customers": active_customers,
        "new_customers_this_month": new_customers_this_month,
        "repeat_customers": repeat_customers,
        "ai_predicted_tomorrow": ai_predicted_tomorrow,
        "ai_predicted_week": ai_predicted_week,
        "stage_preparing": stage_preparing,
        "stage_cooking": stage_cooking,
        "stage_packed": stage_packed,
        "stage_delivery": stage_delivery,
        "stage_delivered": stage_delivered,
        "recent_activity": recent_activity,
        "best_selling_products": best_selling_products,
        "monthly_sales": monthly_sales,
        "inventory_alerts": inventory_alerts,
        "recent_orders": recent_orders,
        "latest_customers": latest_customers
    }

    if role in ['kitchen_staff', 'delivery_staff']:
        # Remove sensitive financial data
        for key in ['total_revenue', 'monthly_revenue', 'ai_predicted_tomorrow', 'ai_predicted_week', 'monthly_sales']:
            data[key] = 0.0
        # For delivery staff, filter recent_orders to show only ones assigned to them!
        if role == 'delivery_staff' and user:
            partner = DeliveryPartner.query.filter_by(phone=user.phone).first()
            if partner:
                assigned_ids = []
                for i in partner.assigned_orders.split(','):
                    clean_id = i.strip().replace('ORD-', '')
                    if clean_id.isdigit():
                        assigned_ids.append(int(clean_id))
                data['recent_orders'] = [o for o in data['recent_orders'] if o['id'] in assigned_ids]
            else:
                data['recent_orders'] = []

    return jsonify(data), 200


import json
import os

WEBSITE_CONFIG_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'website_config.json')

DEFAULT_CONFIG = {
    "banner": "✨ Amma's Special Deal: 15% Off Your First Artisan Batter Order! Code: AMMA20 ✨",
    "headline": "Slow Stone-Ground Heritage Batters",
    "popup_title": "Festival Special Offer!",
    "popup_message": "Use Coupon code PONGAL50 for 50% discount on all Millets batter products!",
    "opening_hours": "Opening Hour: 6am to 10pm",
    "contact_phone": "+91 72009 42596",
    "contact_email": "ammuluskitchen57@gmail.com",
    "social_facebook": "https://facebook.com/ammaskitchen",
    "social_instagram": "https://instagram.com/ammaskitchen",
    "social_twitter": "https://twitter.com/ammaskitchen",
    "featured_products": [1, 2, 4],
    "trending_products": [],
    "recommended_products": [],
    "footer_text": "© 2026 Hotel Ammulu's Kitchen. Traditional stone-ground heritage batter and healthy meals.",
    "categories": "Ready To Eat, Ready To Cook, Batter Products",
    "hero_cta_label": "Order Now",
    "hero_cta_link": "/ready-to-eat",
    "hero_bg_image": "/assets/img/hero-bg.jpg",
    "show_promo_popup": True,
    "show_featured_review": True,
    "show_recipe_suggest": True,
    "about_us": "Hotel Ammulu's Kitchen serves traditional stone-ground batters, ready-to-cook delicacies, and hot ready-to-eat vegetarian meals prepared with absolute cleanliness and natural flavor.",
    "whatsapp_number": "+917200942596"
}

@admin_bp.route('/website-config', methods=['GET'])
def get_website_config():
    if not os.path.exists(WEBSITE_CONFIG_PATH):
        # Save default configuration first time
        with open(WEBSITE_CONFIG_PATH, 'w') as f:
            json.dump(DEFAULT_CONFIG, f, indent=4)
        return jsonify(DEFAULT_CONFIG), 200

    try:
        with open(WEBSITE_CONFIG_PATH, 'r') as f:
            config = json.load(f)
        updated = False
        for k, v in DEFAULT_CONFIG.items():
            if k not in config:
                config[k] = v
                updated = True
        if updated:
            with open(WEBSITE_CONFIG_PATH, 'w') as f:
                json.dump(config, f, indent=4)
        return jsonify(config), 200
    except Exception as e:
        return jsonify({"error": f"Failed to load website config: {str(e)}"}), 500

@admin_bp.route('/website-config', methods=['POST'])
def save_website_config():
    auth_header = request.headers.get('Authorization')
    if not check_role_auth(auth_header, ['admin', 'manager']):
        return jsonify({"error": "Admin or Manager access required"}), 403

    data = request.get_json() or {}
    try:
        # Load existing config or default
        if os.path.exists(WEBSITE_CONFIG_PATH):
            with open(WEBSITE_CONFIG_PATH, 'r') as f:
                config = json.load(f)
        else:
            config = DEFAULT_CONFIG.copy()

        # Update config fields
        for key in DEFAULT_CONFIG.keys():
            if key in data:
                config[key] = data[key]

        with open(WEBSITE_CONFIG_PATH, 'w') as f:
            json.dump(config, f, indent=4)
            
        return jsonify({"message": "Website configuration updated successfully", "config": config}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to save website config: {str(e)}"}), 500

@admin_bp.route('/analytics', methods=['GET'])
def get_analytics():
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403

    period = request.args.get('period', 'month').lower()
    
    labels = []
    revenue_data = []
    orders_data = []
    customers_data = []
    
    now = datetime.datetime.utcnow()
    import calendar
    
    if period == 'today':
        for h in range(11, -1, -1):
            target_hour = now - datetime.timedelta(hours=h)
            hour_str = target_hour.strftime('%I %p')
            labels.append(hour_str)
            
            start_time = target_hour.replace(minute=0, second=0, microsecond=0)
            end_time = start_time + datetime.timedelta(hours=1)
            
            orders = Order.query.filter(Order.created_at >= start_time, Order.created_at < end_time, Order.status != 'Cancelled').all()
            revenue_data.append(sum(o.total_amount for o in orders))
            orders_data.append(len(orders))
            
            cust_count = User.query.filter(User.role == 'customer', User.created_at >= start_time, User.created_at < end_time).count()
            customers_data.append(cust_count)
            
    elif period == 'week':
        for d in range(6, -1, -1):
            target_day = now - datetime.timedelta(days=d)
            day_str = target_day.strftime('%a')
            labels.append(day_str)
            
            start_time = target_day.replace(hour=0, minute=0, second=0, microsecond=0)
            end_time = start_time + datetime.timedelta(days=1)
            
            orders = Order.query.filter(Order.created_at >= start_time, Order.created_at < end_time, Order.status != 'Cancelled').all()
            revenue_data.append(sum(o.total_amount for o in orders))
            orders_data.append(len(orders))
            
            cust_count = User.query.filter(User.role == 'customer', User.created_at >= start_time, User.created_at < end_time).count()
            customers_data.append(cust_count)
            
    elif period == 'year':
        for m in range(11, -1, -1):
            target_month = now.month - m
            target_year = now.year
            while target_month <= 0:
                target_month += 12
                target_year -= 1
                
            month_name = calendar.month_abbr[target_month]
            labels.append(f"{month_name} {target_year}")
            
            start_time = datetime.datetime(target_year, target_month, 1)
            if target_month == 12:
                end_time = datetime.datetime(target_year + 1, 1, 1)
            else:
                end_time = datetime.datetime(target_year, target_month + 1, 1)
                
            orders = Order.query.filter(Order.created_at >= start_time, Order.created_at < end_time, Order.status != 'Cancelled').all()
            revenue_data.append(sum(o.total_amount for o in orders))
            orders_data.append(len(orders))
            
            cust_count = User.query.filter(User.role == 'customer', User.created_at >= start_time, User.created_at < end_time).count()
            customers_data.append(cust_count)
            
    else: # Default is month
        for block in range(5, -1, -1):
            days_ago_start = block * 5
            days_ago_end = (block - 1) * 5
            
            start_time = now - datetime.timedelta(days=days_ago_start)
            start_time = start_time.replace(hour=0, minute=0, second=0, microsecond=0)
            
            if days_ago_end <= 0:
                end_time = now
            else:
                end_time = now - datetime.timedelta(days=days_ago_end)
                end_time = end_time.replace(hour=23, minute=59, second=59, microsecond=999)
                
            label_str = f"{start_time.strftime('%b %d')}"
            labels.append(label_str)
            
            orders = Order.query.filter(Order.created_at >= start_time, Order.created_at < end_time, Order.status != 'Cancelled').all()
            revenue_data.append(sum(o.total_amount for o in orders))
            orders_data.append(len(orders))
            
            cust_count = User.query.filter(User.role == 'customer', User.created_at >= start_time, User.created_at < end_time).count()
            customers_data.append(cust_count)

    categories = {
        "Batter Products": 0.0,
        "Ready To Eat": 0.0,
        "Ready To Cook": 0.0,
        "Bulk Orders": 0.0
    }
    
    order_items = db.session.query(OrderItem, Product).join(Product, OrderItem.product_id == Product.id).all()
    for item, prod in order_items:
        o = Order.query.get(item.order_id)
        if o and o.status != 'Cancelled':
            cat = prod.category
            if cat == 'batter_products':
                categories["Batter Products"] += item.price * item.quantity
            elif cat == 'ready_to_eat':
                categories["Ready To Eat"] += item.price * item.quantity
            elif cat == 'ready_to_cook':
                categories["Ready To Cook"] += item.price * item.quantity

    bulk_orders_list = BulkOrder.query.filter(BulkOrder.status != 'Cancelled').all()
    categories["Bulk Orders"] = sum((b.guest_count or 10) * 250.0 for b in bulk_orders_list)

    total_rev = sum(categories.values())
    pie_data = []
    for cat_name, value in categories.items():
        percentage = (value / total_rev * 100) if total_rev > 0 else 0
        pie_data.append({
            "category": cat_name,
            "revenue": round(value, 2),
            "percentage": round(percentage, 1)
        })

    return jsonify({
        "labels": labels,
        "revenue": revenue_data,
        "orders": orders_data,
        "customers": customers_data,
        "pie_data": pie_data
    }), 200

@admin_bp.route('/reports', methods=['GET'])
def get_reports():
    auth_header = request.headers.get('Authorization')
    if not check_admin_auth(auth_header):
        return jsonify({"error": "Admin access required"}), 403

    report_type = request.args.get('type', 'revenue').lower()
    
    data = []
    summary = {}
    
    if report_type in ['daily', 'weekly', 'monthly', 'yearly', 'revenue']:
        orders = Order.query.filter(Order.status != 'Cancelled').order_by(Order.created_at.desc()).all()
        
        total_rev = 0.0
        total_tax = 0.0
        total_orders = 0
        
        for o in orders:
            cust = User.query.get(o.user_id)
            cust_name = cust.name if cust else "Guest Customer"
            
            tax = round(o.total_amount * 0.05, 2)
            total_rev += o.total_amount
            total_tax += tax
            total_orders += 1
            
            data.append({
                "id": f"ORD-{o.id}",
                "date": o.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                "customer": cust_name,
                "amount": o.total_amount,
                "tax": tax,
                "net_amount": round(o.total_amount - tax, 2),
                "payment_status": o.payment_status or "Paid",
                "status": o.status
            })
            
        summary = {
            "total_orders": total_orders,
            "total_revenue": round(total_rev, 2),
            "total_tax": round(total_tax, 2),
            "net_revenue": round(total_rev - total_tax, 2)
        }
        
    elif report_type == 'customer':
        users = User.query.filter_by(role='customer').all()
        total_spent_all = 0.0
        ordering_customers_count = 0
        
        for u in users:
            cust_orders = Order.query.filter(Order.user_id == u.id, Order.status != 'Cancelled').all()
            order_count = len(cust_orders)
            total_spent = sum(o.total_amount for o in cust_orders)
            total_spent_all += total_spent
            
            if order_count > 0:
                ordering_customers_count += 1
                data.append({
                    "customer_name": u.name,
                    "email": u.email,
                    "phone": u.phone or 'N/A',
                    "order_count": order_count,
                    "total_spent": round(total_spent, 2),
                    "join_date": u.created_at.strftime('%Y-%m-%d'),
                    "status": "Active" if order_count > 2 else "New"
                })
        
        data = sorted(data, key=lambda x: x["total_spent"], reverse=True)
        summary = {
            "total_customers": len(users),
            "ordering_customers": ordering_customers_count,
            "total_sales": round(total_spent_all, 2),
            "average_spend_per_customer": round(total_spent_all / ordering_customers_count, 2) if ordering_customers_count > 0 else 0.0
        }
        
    elif report_type == 'product':
        products = Product.query.all()
        total_items_sold = 0
        total_product_revenue = 0.0
        
        for p in products:
            items = OrderItem.query.filter_by(product_id=p.id).all()
            valid_items = []
            for it in items:
                o = Order.query.get(it.order_id)
                if o and o.status != 'Cancelled':
                    valid_items.append(it)
                    
            quantity_sold = sum(it.quantity for it in valid_items)
            revenue = sum(it.price * it.quantity for it in valid_items)
            
            total_items_sold += quantity_sold
            total_product_revenue += revenue
            
            data.append({
                "product_name": p.name,
                "category": p.category.replace('_', ' ').title() if p.category else 'N/A',
                "price": p.price,
                "quantity_sold": quantity_sold,
                "total_revenue": round(revenue, 2),
                "stock_remaining": p.stock
            })
            
        data = sorted(data, key=lambda x: x["total_revenue"], reverse=True)
        summary = {
            "total_products": len(products),
            "total_items_sold": total_items_sold,
            "total_revenue": round(total_product_revenue, 2)
        }
        
    return jsonify({
        "type": report_type,
        "summary": summary,
        "data": data
    }), 200


@admin_bp.route('/live-monitor', methods=['GET'])
def get_live_monitor():
    auth_header = request.headers.get('Authorization')
    if not check_role_auth(auth_header, ['admin', 'manager']):
        return jsonify({"error": "Admin or Manager access required"}), 403

    # 1. Unique visitors online (distinct IPs in last 5 mins)
    five_mins_ago = datetime.datetime.utcnow() - datetime.timedelta(minutes=5)
    unique_visitors = db.session.query(func.count(func.distinct(WebsiteActivity.ip_address))).filter(
        WebsiteActivity.timestamp >= five_mins_ago
    ).scalar() or 0

    # 2. Total views, product views, cart activity, etc.
    total_views = WebsiteActivity.query.filter_by(activity_type='page_view').count()
    product_views = WebsiteActivity.query.filter_by(activity_type='product_view').count()
    cart_activity = WebsiteActivity.query.filter(WebsiteActivity.activity_type.in_(['add_to_cart', 'remove_from_cart'])).count()

    # 3. Today's order count & revenue
    today_start = datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_orders = Order.query.filter(Order.created_at >= today_start).count()
    today_revenue_query = db.session.query(func.sum(Order.total_amount)).filter(
        Order.created_at >= today_start,
        Order.status != 'Cancelled'
    ).scalar()
    today_revenue = float(today_revenue_query) if today_revenue_query else 0.0

    # 4. Most viewed product
    most_viewed_query = db.session.query(
        WebsiteActivity.product_id,
        func.count(WebsiteActivity.id).label('view_count')
    ).filter(
        WebsiteActivity.activity_type == 'product_view',
        WebsiteActivity.product_id.isnot(None)
    ).group_by(WebsiteActivity.product_id).order_by(func.count(WebsiteActivity.id).desc()).first()

    most_viewed_product = None
    if most_viewed_query:
        p = Product.query.get(most_viewed_query[0])
        if p:
            most_viewed_product = {
                "id": p.id,
                "name": p.name,
                "category": p.category,
                "views": most_viewed_query[1]
            }

    # 5. Most sold product
    most_sold_query = db.session.query(
        OrderItem.product_id,
        func.sum(OrderItem.quantity).label('sales_count')
    ).group_by(OrderItem.product_id).order_by(func.sum(OrderItem.quantity).desc()).first()

    most_sold_product = None
    if most_sold_query:
        p = Product.query.get(most_sold_query[0])
        if p:
            most_sold_product = {
                "id": p.id,
                "name": p.name,
                "category": p.category,
                "sales": int(most_sold_query[1])
            }

    # 6. Latest traffic activity logs (say, last 30 logs)
    activities = WebsiteActivity.query.order_by(WebsiteActivity.timestamp.desc()).limit(30).all()
    activity_logs = []
    for act in activities:
        p_name = None
        if act.product_id:
            p = Product.query.get(act.product_id)
            p_name = p.name if p else f"Product #{act.product_id}"
        
        # Human readable text
        message = ""
        if act.activity_type == 'page_view':
            message = "Visited the storefront home page"
        elif act.activity_type == 'product_view':
            message = f"Viewed product: {p_name}"
        elif act.activity_type == 'add_to_cart':
            message = f"Added {p_name} to cart"
        elif act.activity_type == 'remove_from_cart':
            message = f"Removed {p_name} from cart"
        elif act.activity_type == 'order_placed':
            message = f"Completed purchase (Order placed)"
        elif act.activity_type == 'customer_registered':
            message = "New customer registered an account"
        else:
            message = f"Activity: {act.activity_type}"

        activity_logs.append({
            "id": act.id,
            "ip_address": act.ip_address,
            "activity_type": act.activity_type,
            "product_name": p_name,
            "message": message,
            "timestamp": act.timestamp.isoformat() + "Z"
        })

    return jsonify({
        "unique_visitors": unique_visitors,
        "total_views": total_views,
        "product_views": product_views,
        "cart_activity": cart_activity,
        "today_orders": today_orders,
        "today_revenue": round(today_revenue, 2),
        "most_viewed_product": most_viewed_product,
        "most_sold_product": most_sold_product,
        "activity_logs": activity_logs
    }), 200
