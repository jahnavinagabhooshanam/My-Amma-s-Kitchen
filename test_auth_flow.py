#!/usr/bin/env python3
"""
Test script to verify JWT authentication flow in Hotel Amma's Kitchen
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:5000/api"

print("=" * 80)
print("Hotel Amma's Kitchen - Auth Flow Test")
print("=" * 80)

# Test 1: Health Check
print("\n[TEST 1] Health Check")
try:
    response = requests.get("http://localhost:5000/api/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"ERROR: {e}")

# Test 2: Get Sample Products (No Auth Required)
print("\n[TEST 2] Get Products (No Auth Required)")
try:
    response = requests.get(f"{BASE_URL}/products")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        products = response.json()
        print(f"Found {len(products)} products")
        if products:
            print(f"Sample: {products[0]}")
except Exception as e:
    print(f"ERROR: {e}")

# Test 3: Login
print("\n[TEST 3] User Login")
login_data = {
    "email": "customer@test.com",
    "password": "Customer@123"
}
token = None
user_id = None
try:
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}")
    if response.status_code == 200:
        token = result.get('token')
        user = result.get('user', {})
        user_id = user.get('id')
        print(f"\n✓ Login successful!")
        print(f"  Token (first 50 chars): {token[:50] if token else 'None'}...")
        print(f"  User ID: {user_id}")
        print(f"  User Name: {user.get('name')}")
        print(f"  User Email: {user.get('email')}")
except Exception as e:
    print(f"ERROR: {e}")

# Test 4: Access Protected Route Without Token
print("\n[TEST 4] Get Cart (No Auth Header)")
try:
    response = requests.get(f"{BASE_URL}/cart")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"ERROR: {e}")

# Test 5: Access Protected Route With Token
print("\n[TEST 5] Get Cart (With Auth Header)")
if token:
    try:
        headers = {
            "Authorization": f"Bearer {token}"
        }
        response = requests.get(f"{BASE_URL}/cart", headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        if response.status_code == 200:
            print("✓ Cart access successful!")
    except Exception as e:
        print(f"ERROR: {e}")
else:
    print("Skipped - No token available from login")

# Test 6: Get Orders
print("\n[TEST 6] Get Orders (With Auth Header)")
if token:
    try:
        headers = {
            "Authorization": f"Bearer {token}"
        }
        response = requests.get(f"{BASE_URL}/orders", headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        if response.status_code == 200:
            print("✓ Orders access successful!")
    except Exception as e:
        print(f"ERROR: {e}")
else:
    print("Skipped - No token available from login")

# Test 7: Add to Cart
print("\n[TEST 7] Add to Cart (With Auth Header)")
if token:
    try:
        headers = {
            "Authorization": f"Bearer {token}"
        }
        cart_data = {
            "product_id": 1,
            "quantity": 2
        }
        response = requests.post(f"{BASE_URL}/cart", json=cart_data, headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"ERROR: {e}")
else:
    print("Skipped - No token available from login")

# Test 8: Decode Token Manually
print("\n[TEST 8] Token Validation Check")
if token:
    import jwt
    from datetime import datetime
    try:
        # Decode without verification
        decoded = jwt.decode(token, options={"verify_signature": False})
        print(f"Token payload (unverified):")
        print(json.dumps(decoded, indent=2, default=str))
        
        # Check expiration
        exp_time = datetime.fromtimestamp(decoded.get('exp', 0))
        current_time = datetime.utcnow()
        if exp_time > current_time:
            print(f"✓ Token is valid (expires at {exp_time})")
        else:
            print(f"✗ Token is expired (was valid until {exp_time})")
    except Exception as e:
        print(f"ERROR decoding token: {e}")
else:
    print("Skipped - No token available")

print("\n" + "=" * 80)
print("Test Complete")
print("=" * 80)
