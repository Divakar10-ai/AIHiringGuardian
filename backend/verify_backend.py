import requests
import subprocess
import time
import sys

BASE_URL = "http://localhost:8000"

def wait_for_server():
    for _ in range(30):
        try:
            r = requests.get(f"{BASE_URL}/health")
            if r.status_code == 200:
                return True
        except:
            pass
        time.sleep(1)
    return False

def run_tests():
    print("Starting tests...")
    
    # 2. Verify /docs loads
    r = requests.get(f"{BASE_URL}/docs")
    assert r.status_code == 200, "/docs failed"
    print("PASS: /docs loads")
    
    # 3. Verify /health
    r = requests.get(f"{BASE_URL}/health")
    assert r.status_code == 200, "/health failed"
    print("PASS: /health")
    
    # 4. Create/login users
    # Admin
    requests.post(f"{BASE_URL}/api/v1/auth/register", json={"name":"A1", "email":"a@b.c", "password":"p", "role":"ADMIN"})
    r = requests.post(f"{BASE_URL}/api/v1/auth/login", data={"username":"a@b.c", "password":"p"})
    admin_token = r.json()["access_token"]
    
    # HR
    requests.post(f"{BASE_URL}/api/v1/auth/register", json={"name":"H1", "email":"h@b.c", "password":"p", "role":"HR_REVIEWER"})
    r = requests.post(f"{BASE_URL}/api/v1/auth/login", data={"username":"h@b.c", "password":"p"})
    hr_token = r.json()["access_token"]
    
    # Auditor
    requests.post(f"{BASE_URL}/api/v1/auth/register", json={"name":"AU1", "email":"au@b.c", "password":"p", "role":"AUDITOR"})
    r = requests.post(f"{BASE_URL}/api/v1/auth/login", data={"username":"au@b.c", "password":"p"})
    aud_token = r.json()["access_token"]
    
    print("PASS: Create/login users")
    
    # 5. Register AI Tool
    r = requests.post(f"{BASE_URL}/api/v1/ai-tools/", json={
        "name": "Tool X", "vendor": "VX", "version": "1", "purpose": "Test", "approval_status": "Approved"
    }, headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    tool_id = r.json()["id"]
    print("PASS: Register AI tool")
    
    # 6. Create candidate
    r = requests.post(f"{BASE_URL}/api/v1/candidates/", json={
        "name": "Cand Y", "email": "cy@b.c", "target_role": "Dev"
    }, headers={"Authorization": f"Bearer {hr_token}"})
    assert r.status_code == 200
    cand_id = r.json()["id"]
    print("PASS: Create candidate")

    # 6b. Duplicate candidate email test
    r_dup = requests.post(f"{BASE_URL}/api/v1/candidates/", json={
        "name": "Cand Y Clone", "email": "cy@b.c", "target_role": "Dev"
    }, headers={"Authorization": f"Bearer {hr_token}"})
    assert r_dup.status_code == 400
    print("PASS: Duplicate candidate rejected")
    
    # 7. Submit consent
    r = requests.post(f"{BASE_URL}/api/v1/candidates/{cand_id}/consent", json={
        "ai_screening_consent": True, "automated_interview_consent": True,
        "data_retention_consent": True, "communication_preferences": "Email"
    }, headers={"Authorization": f"Bearer {hr_token}"})
    assert r.status_code == 200
    print("PASS: Submit candidate consent")
    
    # 8. Create evaluation
    r = requests.post(f"{BASE_URL}/api/v1/evaluations/", json={
        "candidate_id": cand_id, "ai_tool_id": tool_id, "workflow_stage": "Init"
    }, headers={"Authorization": f"Bearer {hr_token}"})
    assert r.status_code == 200
    eval_id = r.json()["id"]
    print("PASS: Create evaluation")
    
    # 9. Retrieve eval and verify factors
    r = requests.get(f"{BASE_URL}/api/v1/evaluations/{eval_id}")
    assert r.status_code == 200
    eval_data = r.json()
    assert "score" in eval_data and "recommendation" in eval_data
    assert "factors_considered" in eval_data["explanation"]
    print("PASS: Retrieve evaluation and verify structure")
    
    # 10. Attempt override WITHOUT reason
    r = requests.post(f"{BASE_URL}/api/v1/evaluations/{eval_id}/review", json={
        "decision": "Overridden", "override": True
    }, headers={"Authorization": f"Bearer {hr_token}"})
    assert r.status_code == 400
    print("PASS: Override without reason rejected")
    
    # 11. Attempt override WITH reason
    r = requests.post(f"{BASE_URL}/api/v1/evaluations/{eval_id}/review", json={
        "decision": "Overridden", "override": True, "override_reason": "Good candidate"
    }, headers={"Authorization": f"Bearer {hr_token}"})
    assert r.status_code == 200
    print("PASS: Override with reason accepted")
    
    # 12. Retrieve Audit
    r = requests.get(f"{BASE_URL}/api/v1/audit/?candidate_id={cand_id}", headers={"Authorization": f"Bearer {aud_token}"})
    assert r.status_code == 200
    assert len(r.json()) >= 4 # create, consent, eval, review
    print("PASS: Retrieve audit trail")
    
    # 13 & 14. Retrieve Decision Replay
    r = requests.get(f"{BASE_URL}/api/v1/candidates/{cand_id}/decision-replay", headers={"Authorization": f"Bearer {aud_token}"})
    assert r.status_code == 200
    replay = r.json()
    assert len(replay) >= 4
    # Check ordering
    for i in range(1, len(replay)):
        assert replay[i]["sequence_number"] > replay[i-1]["sequence_number"]
    events = [x["event_type"] for x in replay]
    assert "CANDIDATE_CREATED" in events
    assert "CONSENT_RECORDED" in events
    assert "EVALUATION_COMPLETED" in events
    assert "HUMAN_REVIEW_OVERRIDE" in events
    print("PASS: Retrieve & verify Decision Replay ordering")
    
    # RBAC Tests
    r = requests.post(f"{BASE_URL}/api/v1/ai-tools/", json={
        "name": "Tool Z", "vendor": "VZ", "version": "1", "purpose": "Test", "approval_status": "Approved"
    }, headers={"Authorization": f"Bearer {hr_token}"})
    assert r.status_code in [401, 403], f"HR should not create AI tools, got {r.status_code}"
    print("PASS: RBAC HR cannot manage AI Tools")
    
    r = requests.post(f"{BASE_URL}/api/v1/evaluations/", json={
        "candidate_id": cand_id, "ai_tool_id": tool_id, "workflow_stage": "Init"
    }, headers={"Authorization": f"Bearer {aud_token}"})
    assert r.status_code in [401, 403], "Auditor should not evaluate"
    print("PASS: RBAC Auditor cannot run evaluations")
    
    # CORS options preflight test
    r = requests.options(f"{BASE_URL}/api/v1/candidates/", headers={
        "Origin": "http://evil.com",
        "Access-Control-Request-Method": "GET"
    })
    # If the origin is not allowed, Access-Control-Allow-Origin shouldn't be the evil origin
    allowed_origin = r.headers.get("Access-Control-Allow-Origin")
    assert allowed_origin != "http://evil.com" and allowed_origin != "*", f"Wildcard or evil CORS detected: {allowed_origin}"
    print("PASS: CORS is not wildcard")

    return cand_id, eval_id, aud_token

if __name__ == "__main__":
    import os
    # Delete DB if it exists so we have a clean state
    if os.path.exists("aihiringguardian.db"):
        os.remove("aihiringguardian.db")
    
    print("Running migrations...")
    subprocess.run(["venv\\\\Scripts\\\\alembic", "upgrade", "head"])
    
    print("Starting server...")
    proc = subprocess.Popen(["venv\\\\Scripts\\\\uvicorn", "app.main:app", "--port", "8000"])
    if not wait_for_server():
        print("FAIL: Server did not start")
        proc.kill()
        sys.exit(1)
        
    try:
        cand_id, eval_id, aud_token = run_tests()
    except Exception as e:
        print(f"FAIL Exception: {e}")
        proc.kill()
        sys.exit(1)
        
    print("Stopping server...")
    proc.terminate()
    proc.wait()
    time.sleep(2)
    
    print("Restarting server...")
    proc2 = subprocess.Popen(["venv\\\\Scripts\\\\uvicorn", "app.main:app", "--port", "8000"])
    if not wait_for_server():
        print("FAIL: Server did not start second time")
        proc2.kill()
        sys.exit(1)
        
    try:
        r = requests.get(f"{BASE_URL}/api/v1/candidates/{cand_id}")
        assert r.status_code == 200, "Candidate lost"
        r = requests.get(f"{BASE_URL}/api/v1/evaluations/{eval_id}")
        assert r.status_code == 200, "Eval lost"
        r = requests.get(f"{BASE_URL}/api/v1/audit/?candidate_id={cand_id}", headers={"Authorization": f"Bearer {aud_token}"})
        assert r.status_code == 200 and len(r.json()) > 0, "Audit lost"
        print("PASS: Data persists after restart")
    finally:
        proc2.terminate()
        proc2.wait()
    
    print("All Python API Tests Passed!")
