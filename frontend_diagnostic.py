#!/usr/bin/env python3
"""
Comprehensive Frontend-Backend Auth Flow Diagnostic
Simulates what the frontend should do when logging in
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:5000/api"

print("=" * 80)
print("FRONTEND SIMULATION - Auth Flow Diagnostic")
print("=" * 80)

# Simulate browser localStorage
browser_storage = {}

print("\n[STEP 1] User submits login form")
print("  Email: customer@test.com")
print("  Password: Customer@123")

# Step 2: Frontend calls authService.login()
print("\n[STEP 2] Frontend calls authService.login() - POST /auth/login")
login_payload = {
    "email": "customer@test.com",
    "password": "Customer@123"
}
response = requests.post(f"{BASE_URL}/auth/login", json=login_payload)
print(f"  Response Status: {response.status_code}")

if response.status_code == 200:
    data = response.json()
    token = data.get('token')
    user = data.get('user', {})
    
    print(f"  ✓ Login successful")
    print(f"  Token received: {token[:50]}...")
    print(f"  User: {user.get('name')} ({user.get('email')})")
    
    # Step 3: Frontend stores token in localStorage
    print("\n[STEP 3] Frontend stores token in localStorage")
    browser_storage['amma_token'] = token
    browser_storage['auth_provider'] = 'custom'
    print(f"  ✓ localStorage['amma_token'] = '{token[:50]}...'")
    print(f"  ✓ localStorage['auth_provider'] = 'custom'")
    
    # Step 4: Frontend makes authenticated requests
    print("\n[STEP 4] Frontend makes authenticated API calls")
    
    headers = {
        'Authorization': f'Bearer {token}'
    }
    
    # Request 1: Get Cart
    print("\n  [4a] GET /cart with Authorization header")
    response = requests.get(f"{BASE_URL}/cart", headers=headers)
    print(f"    Status: {response.status_code}")
    if response.status_code == 200:
        print(f"    ✓ Cart loaded: {response.json()}")
    else:
        print(f"    ✗ FAILED: {response.json()}")
    
    # Request 2: Get Orders
    print("\n  [4b] GET /orders with Authorization header")
    response = requests.get(f"{BASE_URL}/orders", headers=headers)
    print(f"    Status: {response.status_code}")
    if response.status_code == 200:
        print(f"    ✓ Orders loaded: {response.json()}")
    else:
        print(f"    ✗ FAILED: {response.json()}")
    
    # Request 3: Add to Cart
    print("\n  [4c] POST /cart (add item) with Authorization header")
    cart_payload = {
        "product_id": 2,
        "quantity": 1
    }
    response = requests.post(f"{BASE_URL}/cart", json=cart_payload, headers=headers)
    print(f"    Status: {response.status_code}")
    if response.status_code == 200:
        print(f"    ✓ Item added: {response.json()}")
    else:
        print(f"    ✗ FAILED: {response.json()}")
    
    # Request 4: Get Profile
    print("\n  [4d] GET /auth/profile with Authorization header")
    response = requests.get(f"{BASE_URL}/auth/profile", headers=headers)
    print(f"    Status: {response.status_code}")
    if response.status_code == 200:
        profile = response.json()
        print(f"    ✓ Profile loaded: {profile.get('user', {}).get('name')}")
    else:
        print(f"    ✗ FAILED: {response.json()}")
    
    # Step 5: Verify token is being sent correctly
    print("\n[STEP 5] Verify API interceptor behavior")
    print(f"  localStorage['amma_token'] exists: {'amma_token' in browser_storage}")
    print(f"  Token value (first 50 chars): {browser_storage.get('amma_token', 'NOT FOUND')[:50]}...")
    
    # Step 6: Check token expiration
    print("\n[STEP 6] Token Expiration Check")
    import jwt
    decoded = jwt.decode(token, options={"verify_signature": False})
    exp_time = datetime.fromtimestamp(decoded.get('exp', 0))
    print(f"  Token expires: {exp_time}")
    print(f"  Token is valid: {exp_time > datetime.utcnow()}")
    
else:
    print(f"  ✗ Login failed with status {response.status_code}")
    print(f"  Response: {response.json()}")

print("\n" + "=" * 80)
print("DIAGNOSIS COMPLETE")
print("=" * 80)

print("""
KEY FINDINGS:
- If all tests above show ✓, the backend auth is working correctly
- Frontend should store token in localStorage['amma_token']
- Frontend should send Authorization: Bearer {token} header with each request
- If cart/orders return 200, the auth flow is complete

POSSIBLE ISSUES IF TESTS FAIL:
1. Frontend not storing token in localStorage
2. Frontend not sending Authorization header
3. API interceptor not reading token from correct localStorage key
4. Firebase interfering with backend token flow
5. Token not being passed to API calls due to timing issues
""")
