import os
import random
from app import app
from database.db import db
from database.models import Product, BatterProduct

# Define the local directories where the images are stored in admin/src/assets/Food images
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_PATH = os.path.join(SCRIPT_DIR, '..', 'admin', 'src', 'assets', 'Food images')

# Helper function to generate descriptions and prices
def get_product_details(name, category):
    # Dictionary of specific descriptions for premium South Indian restaurant/food ERP
    details = {
        # Batters
        "Adai Batter": ("Stone-ground mixed lentils (toor, chana, urad, moong) batter seasoned with red chillies, ginger, and curry leaves. Zero preservatives.", 110.00, 95.00),
        "Appam Batter": ("Perfectly ground fermented rice and coconut batter to yield paper-thin borders and fluffy soft center appams.", 90.00, 80.00),
        "Dosa Batter": ("Stone-ground premium rice & black gram. Higher fenugreek blend to yield golden, extra-crispy homestyle dosas.", 85.00, 75.00),
        "Idli Batter": ("Stone-ground parboiled rice & premium split black gram. Formulated for perfectly soft, pillowy, and fluffy idlis.", 80.00, 70.00),
        "Masala Uttapam Batter": ("Coarsely stone-ground seasoned batter, perfect for thick, soft, vegetable-loaded masala uttapams.", 100.00, 90.00),
        "Oats Dosa": ("Nutritious blend of rolled oats, parboiled rice, and black gram ground to perfection. High fiber breakfast choice.", 120.00, 105.00),
        "Poha Batter": ("Lightweight fermented rice flake batter ground slowly. Yields highly digestible, extremely soft and spongy dosas.", 95.00, 85.00),
        "Rava Idli Batter": ("Sooji semolina blend with ghee-roasted cashews, mustard seeds, curry leaves, and ginger. Ready to steam.", 115.00, 100.00),
        "Urid Vada Batter": ("Premium ground black gram paste seasoned with peppercorns, curry leaves, and ginger. Ready to shape and deep fry.", 130.00, 110.00),
        
        # Veg
        "Beetroot Dosa": ("Vibrant and healthy golden crepe infused with fresh organic beetroot puree and pure cow ghee. Served with chutneys.", 120.00, 110.00),
        "Chilli garlic Mushroom": ("Spicy wok-tossed button mushrooms with fresh green chillies, garlic, and scallions in soy-chilli glaze.", 160.00, 145.00),
        "Edli Sambar": ("Four steaming-hot, pillow-soft idlis immersed in aromatic traditional Mylapore lentil sambar. Pure ghee garnish.", 90.00, 80.00),
        "Edli Vada": ("Two steaming soft idlis and one crispy golden medu vada served with piping hot sambar and fresh coconut chutney.", 110.00, 99.00),
        "Egg Curry": ("Dhaba-style rich, onion-tomato gravy packed with aromatic spices and two perfectly boiled, lightly fried eggs.", 140.00, 125.00),
        "Ghee Roast Dosa": ("Golden, paper-thin crispy large dosa roasted with generous amounts of pure premium homestyle cow ghee.", 130.00, 120.00),
        "Gobi Manchurian": ("Crispy deep-fried cauliflower florets tossed in a tangy, sweet, and slightly spicy Indo-Chinese manchurian sauce.", 140.00, 130.00),
        "Honey Chilli Potatoes": ("Sweet & savory crispy potato fingers glazed in natural raw honey, chili paste, and roasted sesame seeds.", 130.00, 120.00),
        "Keema Samosa": ("Crispy, golden-fried triangular pastries stuffed with a seasoned, highly aromatic minced vegetable keema blend.", 80.00, 70.00),
        "Kuzhi Paniyaram": ("Traditional round shallow-fried dumplings made from sour-fermented batter seasoned with mustard, onion, and chillies.", 90.00, 80.00),
        "Medu Vada": ("Three crispy, golden black gram fritters seasoned with fresh ginger, peppercorns, and green chillies. Served with chutneys.", 90.00, 80.00),
        "Moong Dal Dosa": ("Nutritious, high-protein green gram (pesara) crepe filled with chopped onions, green chillies, and ginger.", 110.00, 100.00),
        "Onion Dosa": ("Crispy stone-ground golden rice crepe sprinkled with finely chopped shallots, green chillies, and fresh coriander.", 110.00, 100.00),
        "Paneer Pasanda": ("Rich, royal Mughlai gravy containing shallow-fried paneer sandwiches stuffed with spiced nuts and khoya.", 220.00, 195.00),
        "Paneer Tikka": ("Fresh cottage cheese cubes marinated in spiced yogurt and grilled in a clay oven with onions and bell peppers.", 180.00, 160.00),
        "Pav Bhaji": ("Spicy mashed mixed vegetable curry cooked on a flat tawa with loads of butter, served with two soft roasted buns.", 140.00, 125.00),
        "Podi Edli": ("Mini bite-sized soft steamed idlis tossed in cold-pressed sesame oil and premium aromatic spiced gunpowder (podi).", 110.00, 99.00),
        "Poori Dhal": ("Three puffed golden pooris served with a mildly spiced, delicious potato-onion chana dhal masala curry.", 100.00, 90.00),
        "Ragi Dosa": ("Healthy, iron-rich and calcium-packed finger millet crepe prepared with pure cow ghee. Served with chutneys.", 110.00, 99.00),
        "Rava Idli": ("Three soft steamed semolina idlis enriched with curd, ghee-roasted cashews, mustard seeds, and curry leaves.", 100.00, 90.00),
        "Rava Upma": ("Dry-roasted semolina cooked to a soft, fluffy porridge with ghee, mustard seeds, ginger, green chillies, and cashews.", 80.00, 70.00),
        "South Indian": ("Signature breakfast sampler platter: 1 mini idli, 1 mini vada, 1 mini pongal, 1 mini rava khara bhath, and filter coffee.", 160.00, 140.00),
        "Spicy Popcorm Tofu Nuggets": ("Crunchy, bite-sized deep-fried organic tofu nuggets breaded in highly seasoned, fiery chili spice mix.", 140.00, 125.00),
        "Veg Machurian": ("Delectable deep-fried mixed vegetable balls tossed in aromatic, garlic-infused savory Indo-Chinese sauce.", 140.00, 130.00),
        "Veg Meals": ("Authentic South Indian banana leaf meals: white rice, sambar, rasam, kootu, poriyal, appalam, curd, and sweet payasam.", 180.00, 160.00),
        "Veg Thali": ("Grand deluxe lunch thali: specialty rice, chapati, dhal, paneer butter masala, kootu, raita, papad, pickle, and gulab jamun.", 200.00, 180.00),
        "Ven Pongal": ("Steaming hot, creamy rice and yellow lentil mash cooked with pure cow ghee, black pepper, cumin, ginger, and cashews.", 100.00, 90.00),
        
        # Non-veg
        "Andhra Spicy Chicken Curry": ("Fiery Guntur-style chicken curry slow-cooked with fresh spice powders, poppy seeds, and red chillies.", 240.00, 210.00),
        "Chettinad Prawn Masala": ("Juicy fresh prawns pan-fried in a rich, pepper-loaded authentic Chettinad spice masala paste and curry leaves.", 260.00, 235.00),
        "Crab Chettinadu Sambar": ("Specialty coastal fusion: fresh crab chunks cooked slowly in thick Chettinad spiced lentil sambar gravy.", 200.00, 180.00),
        "Crab Curry": ("Coastal-style crab curry cooked in a delicious ground coconut, red chili, fennel, and black pepper curry gravy.", 280.00, 250.00),
        "Fish Curry": ("Nellore style tangy and spicy fish curry prepared in thick tamarind gravy with locally sourced fresh sea fish.", 240.00, 210.00),
        "Fish Fry": ("Crispy, highly spiced shallow-fried fish steaks marinated in ginger-garlic paste, Guntur chili, and lemon juice.", 200.00, 180.00),
        "Fish Meals": ("Traditional fish curry meals platter: steamed rice, tangy Nellore fish curry, masala fish fry, rasam, and curd.", 250.00, 220.00),
        "Hyderabad Dum Biriyani": ("Aromatic, premium basmati rice slow-cooked on dum with tender spiced chicken, saffron, pure ghee, and nuts.", 260.00, 230.00),
        "Mutton Curry": ("Classic homestyle slow-cooked tender mutton blocks prepared in a rich, spiced onion-tomato curry gravy.", 320.00, 285.00),
        "Rajasthani Mutton Curry": ("Royal Rajasthani Laal Maas: fiery local mutton curry cooked in pure ghee with authentic Mathania dry red chillies.", 340.00, 300.00),
        "Spicy Chicken Roll": ("Golden flaky parotta roll packed with tender charcoal-grilled spiced chicken tikka strips, mint chutney, and onions.", 140.00, 125.00),
        "Tandoori Chicken Tikka": ("Six juicy boneless chicken blocks marinated in spices, mustard oil, and hung curd, grilled in clay tandoor.", 220.00, 195.00),
        "Tandoori Chicken": ("Full tender spring chicken marinated in yogurt, tandoori spices, and Kashmiri chili, roasted to a smokey perfection.", 380.00, 340.00)
    }

    # Normalize name to remove extensions
    base_name = name.split('.')[0]
    
    if base_name in details:
        return base_name, details[base_name][0], details[base_name][1], details[base_name][2]
    
    # Generic fallback
    description = f"Delicious, freshly prepared {base_name.replace('_', ' ')}. Crafted using premium ingredients and traditional home recipes."
    price = 150.00
    offer_price = 135.00
    return base_name, description, price, offer_price

def seed_food_images():
    with app.app_context():
        print("Starting food images database seeding...")
        
        # Clear existing catalog to prevent duplicate key errors
        print("Clearing existing catalog tables...")
        BatterProduct.query.delete()
        Product.query.delete()
        
        # 1. Seed Batters category (batter_products)
        batters_dir = os.path.join(ASSETS_PATH, 'Batters')
        if os.path.exists(batters_dir):
            files = [f for f in os.listdir(batters_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
            print(f"Found {len(files)} batters images.")
            
            for f in files:
                display_name, desc, price, offer_price = get_product_details(f, 'batter_products')
                image_path = f"assets/Food images/Batters/{f}"
                
                # Create main catalog product
                p = Product(
                    name=display_name,
                    category='batter_products',
                    description=desc,
                    price=price,
                    offer_price=offer_price,
                    image=image_path,
                    stock=random.randint(20, 100),
                    is_available=True
                )
                db.session.add(p)
                db.session.flush() # Populate p.id
                
                # Create corresponding BatterProduct variant record
                bp = BatterProduct(
                    id=p.id,
                    product_name=display_name,
                    variant='1kg Pouch',
                    weight='1kg',
                    price=price,
                    offer_price=offer_price,
                    stock=p.stock,
                    expiry_date='4 Days Expiry',
                    manufacture_date='Fresh Ground Daily',
                    image=image_path
                )
                db.session.add(bp)
                print(f"Added Batter product: {display_name} (Price: INR {price})")

        # 2. Seed Veg category
        veg_dir = os.path.join(ASSETS_PATH, 'Veg')
        if os.path.exists(veg_dir):
            files = [f for f in os.listdir(veg_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
            print(f"Found {len(files)} Veg images.")
            
            for f in files:
                display_name, desc, price, offer_price = get_product_details(f, 'ready_to_eat')
                image_path = f"assets/Food images/Veg/{f}"
                
                # Smartly separate into RTE or RTC based on name
                is_rtc = "Mushroom" in display_name or "Manchurian" in display_name or "Tikka" in display_name or "Pasanda" in display_name or "Nuggets" in display_name or "Keema" in display_name
                category = 'ready_to_cook' if is_rtc else 'ready_to_eat'
                
                p = Product(
                    name=display_name,
                    category=category,
                    description=desc,
                    price=price,
                    offer_price=offer_price,
                    image=image_path,
                    stock=random.randint(30, 150),
                    is_available=True
                )
                db.session.add(p)
                print(f"Added Veg product: {display_name} ({category.replace('_', ' ').title()}) - Price: INR {price}")

        # 3. Seed Non-veg category
        nonveg_dir = os.path.join(ASSETS_PATH, 'Non-veg')
        if os.path.exists(nonveg_dir):
            files = [f for f in os.listdir(nonveg_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
            print(f"Found {len(files)} Non-veg images.")
            
            for f in files:
                display_name, desc, price, offer_price = get_product_details(f, 'ready_to_eat')
                image_path = f"assets/Food images/Non-veg/{f}"
                
                p = Product(
                    name=display_name,
                    category='ready_to_eat', # Hot served non-veg dishes are RTE
                    description=desc,
                    price=price,
                    offer_price=offer_price,
                    image=image_path,
                    stock=random.randint(15, 60),
                    is_available=True
                )
                db.session.add(p)
                print(f"Added Non-veg product: {display_name} (Ready To Eat) - Price: INR {price}")

        db.session.commit()
        print("Database catalog successfully updated with all local food images!")

if __name__ == '__main__':
    seed_food_images()
