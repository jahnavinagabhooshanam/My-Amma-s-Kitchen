from app import app
from database.db import db
from database.models import Product

def fix_categories():
    with app.app_context():
        # Fetch all products that have 'batter' in their name or are 'Oats Dosa' or 'Kuzhi Paniyaram'
        batters = Product.query.filter(
            Product.name.ilike('%batter%') | 
            Product.name.ilike('%adai%') | 
            Product.name.ilike('%poha%') | 
            Product.name.ilike('%oats%') | 
            Product.name.ilike('%kuzhi%') | 
            Product.name.ilike('%vada%')
        ).all()
        
        millet_count = 0
        health_count = 0
        traditional_count = 0
        
        for p in batters:
            # Skip if it's already properly categorized or if it's explicitly ready_to_eat that shouldn't be here
            if p.category == 'ready_to_eat' and 'vada' in p.name.lower() and 'batter' not in p.name.lower():
                continue # Skip "Medu Vada (Ready to Eat)"
                
            name_lower = p.name.lower()
            
            if 'millet' in name_lower or 'ragi' in name_lower:
                p.category = 'millet'
                millet_count += 1
            elif 'adai' in name_lower or 'poha' in name_lower or 'oats' in name_lower or 'health' in name_lower:
                p.category = 'health'
                health_count += 1
            else:
                p.category = 'traditional'
                traditional_count += 1
                
        db.session.commit()
        print(f"Updated {millet_count} to millet, {health_count} to health, and {traditional_count} to traditional.")

if __name__ == '__main__':
    fix_categories()
