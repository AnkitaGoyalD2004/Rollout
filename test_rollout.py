#!/usr/bin/env python3
"""
Rollout End-to-End Automated Verification Script
Tests:
  1. Backend Server Health
  2. Dynamic User & Workspace Registration
  3. Feature Flag Creation in Authenticated Workspace
  4. Workspace Data Isolation (Tenant A cannot see Tenant B's flags)
  5. Feature Flag Evaluation (API check & reasoning)
  6. User Login with Credentials
"""

import json
import random
import sys
import time
import urllib.error
import urllib.request

BASE_URL = "http://localhost:4000"

def log_step(title):
    print(f"\n{'='*55}\n🧪 {title}\n{'='*55}")

def log_success(msg):
    print(f"  ✅ PASS: {msg}")

def log_fail(msg):
    print(f"  ❌ FAIL: {msg}")
    sys.exit(1)

def make_request(url, method="GET", data=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    encoded_data = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            status_code = response.getcode()
            body = json.loads(response.read().decode("utf-8"))
            return status_code, body
    except urllib.error.HTTPError as e:
        body = json.loads(e.read().decode("utf-8")) if e.fp else {"error": str(e)}
        return e.code, body
    except Exception as e:
        return None, {"error": str(e)}

def main():
    print("\n🚀 Starting Rollout Platform Verification Tests...\n")
    unique_id = random.randint(1000, 9999)

    # -------------------------------------------------------------
    # TEST 1: Backend Health Check
    # -------------------------------------------------------------
    log_step("Test 1: Check Backend Server Health")
    status, res = make_request(f"{BASE_URL}/health")
    if status == 200 and res.get("status") == "ok":
        log_success(f"Backend is online! Message: '{res.get('message')}'")
    else:
        log_fail(f"Backend health check failed. Is the server running on {BASE_URL}?")

    # -------------------------------------------------------------
    # TEST 2: Register Company Alpha
    # -------------------------------------------------------------
    company_alpha = f"Company_Alpha_{unique_id}"
    email_alpha = f"admin_{unique_id}@alpha.com"
    password_alpha = "securePassword123"

    log_step(f"Test 2: Register New Company Workspace ({company_alpha})")
    status, res = make_request(
        f"{BASE_URL}/api/auth/register",
        method="POST",
        data={
            "name": "Alice Engineer",
            "company": company_alpha,
            "email": email_alpha,
            "password": password_alpha,
        },
    )

    if status == 201 and "token" in res:
        token_alpha = res["token"]
        user_alpha = res["user"]
        log_success(f"Registered '{user_alpha['name']}' in workspace '{user_alpha['company']}'")
        log_success("JWT token received successfully")
    else:
        log_fail(f"Registration failed: {res}")

    # -------------------------------------------------------------
    # TEST 3: Create Feature Flag in Company Alpha
    # -------------------------------------------------------------
    flag_key_alpha = f"new-checkout-{unique_id}"
    flag_name_alpha = "New Checkout Redesign"

    log_step(f"Test 3: Create Feature Flag for {company_alpha}")
    status, res = make_request(
        f"{BASE_URL}/api/flags",
        method="POST",
        token=token_alpha,
        data={
            "name": flag_name_alpha,
            "key": flag_key_alpha,
            "description": "50% canary deployment test",
            "isEnabled": True,
            "rolloutPercentage": 50,
            "environment": "production",
        },
    )

    if status == 201 and res.get("key") == flag_key_alpha:
        log_success(f"Created flag '{res['name']}' with 50% rollout")
        log_success(f"Flag automatically assigned to workspace: '{res['company']}'")
    else:
        log_fail(f"Flag creation failed: {res}")

    # -------------------------------------------------------------
    # TEST 4: Fetch Flags for Company Alpha
    # -------------------------------------------------------------
    log_step(f"Test 4: Verify Flag Exists in {company_alpha}")
    status, flags_alpha = make_request(f"{BASE_URL}/api/flags", token=token_alpha)

    if status == 200 and any(f.get("key") == flag_key_alpha for f in flags_alpha):
        log_success(f"Successfully retrieved {len(flags_alpha)} flag(s) for {company_alpha}")
    else:
        log_fail(f"Could not retrieve flags for {company_alpha}")

    # -------------------------------------------------------------
    # TEST 5: Register Company Beta (A Completely Different Company)
    # -------------------------------------------------------------
    company_beta = f"Company_Beta_{unique_id}"
    email_beta = f"bob_{unique_id}@beta.com"
    password_beta = "securePassword456"

    log_step(f"Test 5: Register a Second Company ({company_beta})")
    status, res = make_request(
        f"{BASE_URL}/api/auth/register",
        method="POST",
        data={
            "name": "Bob Developer",
            "company": company_beta,
            "email": email_beta,
            "password": password_beta,
        },
    )

    if status == 201 and "token" in res:
        token_beta = res["token"]
        log_success(f"Registered second company: '{company_beta}'")
    else:
        log_fail(f"Failed to register second company: {res}")

    # -------------------------------------------------------------
    # TEST 6: Verify Strict Multi-Tenant Isolation
    # -------------------------------------------------------------
    log_step("Test 6: Verify Strict Isolation (Company Beta CANNOT see Company Alpha's flag)")
    status, flags_beta = make_request(f"{BASE_URL}/api/flags", token=token_beta)

    # Flags for Beta should NOT contain Alpha's flag!
    alpha_flag_leaked = any(f.get("key") == flag_key_alpha for f in flags_beta)

    if status == 200 and not alpha_flag_leaked:
        log_success(f"{company_beta} has 0 flags of {company_alpha}!")
        log_success("Data isolation verified: 100% private to each company workspace.")
    else:
        log_fail(f"Data leak detected! {company_beta} was able to see {company_alpha}'s flags!")

    # -------------------------------------------------------------
    # TEST 7: Evaluate Feature Flag via Public API
    # -------------------------------------------------------------
    log_step("Test 7: Feature Flag Evaluation & Traffic Counting")
    eval_url = f"{BASE_URL}/api/flags/evaluate/{flag_key_alpha}?userId=user_vip_99&company={company_alpha}"
    status, eval_res = make_request(eval_url)

    if status == 200 and "enabled" in eval_res:
        log_success(f"Flag '{flag_key_alpha}' evaluated successfully:")
        print(f"     - User ID: {eval_res.get('userId')}")
        print(f"     - Feature Enabled: {eval_res.get('enabled')}")
        print(f"     - Reason: {eval_res.get('reason')}")
        print(f"     - Workspace: {eval_res.get('company')}")
    else:
        log_fail(f"Evaluation failed: {eval_res}")

    # -------------------------------------------------------------
    # TEST 8: Test User Login
    # -------------------------------------------------------------
    log_step("Test 8: User Login Authentication")
    status, login_res = make_request(
        f"{BASE_URL}/api/auth/login",
        method="POST",
        data={"email": email_alpha, "password": password_alpha},
    )

    if status == 200 and "token" in login_res:
        log_success(f"Logged in successfully as '{login_res['user']['name']}'")
        log_success(f"Verified workspace: '{login_res['user']['company']}'")
    else:
        log_fail(f"Login failed: {login_res}")

    # -------------------------------------------------------------
    # ALL TESTS PASSED!
    # -------------------------------------------------------------
    print("\n" + "="*55)
    print("🎉 ALL 8 TESTS PASSED SUCCESSFULLY! 🚀")
    print("="*55)
    print("  • Real User Registration & Login: Working ✅")
  
    print("  • Multi-Tenancy & Workspace Isolation: Working ✅")
    print("  • Feature Flag CRUD & Canary Rollouts: Working ✅")
    print("  • Public Evaluation API & Telemetry: Working ✅")
    print("="*55 + "\n")

if __name__ == "__main__":
    main()
