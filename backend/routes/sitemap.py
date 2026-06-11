from flask import Blueprint, Response

sitemap_bp = Blueprint('sitemap', __name__)

@sitemap_bp.route('/sitemap.xml', methods=['GET'])
def sitemap():
    # Base URLs
    base_url = "http://localhost:5173"
    pages = [
        "/",
        "/menu",
        "/ready-to-eat",
        "/ready-to-cook",
        "/batter-products",
        "/bulk-orders",
        "/contact"
    ]
    
    xml = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    for page in pages:
        xml.append(f'  <url>')
        xml.append(f'    <loc>{base_url}{page}</loc>')
        xml.append(f'    <changefreq>daily</changefreq>')
        xml.append(f'    <priority>0.8</priority>')
        xml.append(f'  </url>')
        
    xml.append('</urlset>')
    
    return Response("\n".join(xml), mimetype='application/xml')

@sitemap_bp.route('/robots.txt', methods=['GET'])
def robots():
    content = """User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: http://localhost:5173/sitemap.xml
"""
    return Response(content, mimetype='text/plain')
