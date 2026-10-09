import pytest

def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_auth_workflow(client, db):
    # Register Admin
    resp = client.post("/api/v1/auth/register", json={
        "name": "Admin User",
        "email": "admin@aihiringguardian.demo",
        "password": "password123",
        "role": "ADMIN"
    })
    assert resp.status_code == 200
    
    # Login
    resp = client.post("/api/v1/auth/login", data={
        "username": "admin@aihiringguardian.demo",
        "password": "password123"
    })
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create AI Tool
    tool_resp = client.post("/api/v1/ai-tools/", json={
        "name": "Test Tool",
        "vendor": "Test Vendor",
        "purpose": "Screening",
        "version": "1.0",
        "approval_status": "Approved",
        "hiring_stage": "Initial",
        "risk_level": "Low"
    }, headers=headers)
    assert tool_resp.status_code == 200
    tool_id = tool_resp.json()["id"]
    
    # Create Candidate
    cand_resp = client.post("/api/v1/candidates/", json={
        "name": "John Doe",
        "email": "john@example.com",
        "target_role": "Developer",
        "skills": "Python, FastAPI",
        "experience": "5 years",
        "education": "BS CS"
    }, headers=headers)
    assert cand_resp.status_code == 200
    cand_id = cand_resp.json()["id"]
    
    # Add Consent
    cons_resp = client.post(f"/api/v1/candidates/{cand_id}/consent", json={
        "ai_screening_consent": True,
        "automated_interview_consent": True,
        "data_retention_consent": True,
        "communication_preferences": "Email"
    }, headers=headers)
    assert cons_resp.status_code == 200
    
    # Run Evaluation
    eval_resp = client.post("/api/v1/evaluations/", json={
        "candidate_id": cand_id,
        "ai_tool_id": tool_id,
        "workflow_stage": "Screening"
    }, headers=headers)
    assert eval_resp.status_code == 200
    eval_id = eval_resp.json()["id"]
    
    # Human Review (Override without reason)
    rev_resp_fail = client.post(f"/api/v1/evaluations/{eval_id}/review", json={
        "decision": "Accepted",
        "override": True
    }, headers=headers)
    assert rev_resp_fail.status_code == 400
    assert "reason MUST be provided" in rev_resp_fail.json()["detail"]
    
    # Human Review (Override with reason)
    rev_resp = client.post(f"/api/v1/evaluations/{eval_id}/review", json={
        "decision": "Accepted",
        "override": True,
        "override_reason": "Better than score indicates"
    }, headers=headers)
    assert rev_resp.status_code == 200
    
    # Audit Retrieval
    audit_resp = client.get(f"/api/v1/audit/?candidate_id={cand_id}", headers=headers)
    assert audit_resp.status_code == 200
    assert len(audit_resp.json()) > 0
    
    # Decision Replay
    replay_resp = client.get(f"/api/v1/candidates/{cand_id}/decision-replay", headers=headers)
    assert replay_resp.status_code == 200
    assert len(replay_resp.json()) > 0

def test_policies(client, db):
    # Register Admin
    client.post("/api/v1/auth/register", json={
        "name": "Admin User",
        "email": "admin@aihiringguardian.demo",
        "password": "password123",
        "role": "ADMIN"
    })
    
    # Login
    resp = client.post("/api/v1/auth/login", data={
        "username": "admin@aihiringguardian.demo",
        "password": "password123"
    })
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create Policy
    pol_resp = client.post("/api/v1/policies/", json={
        "name": "Test AI Policy",
        "description": "Ensure no bias.",
        "category": "AI Bias",
        "status": "ACTIVE"
    }, headers=headers)
    assert pol_resp.status_code == 200
    
    # Get Policies
    get_resp = client.get("/api/v1/policies/", headers=headers)
    assert get_resp.status_code == 200
    assert len(get_resp.json()) >= 1
    assert get_resp.json()[0]["name"] == "Test AI Policy"

def test_monitoring_metrics(client, db):
    client.post("/api/v1/auth/register", json={
        "name": "Admin User",
        "email": "admin@aihiringguardian.demo",
        "password": "password123",
        "role": "ADMIN"
    })
    resp = client.post("/api/v1/auth/login", data={
        "username": "admin@aihiringguardian.demo",
        "password": "password123"
    })
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    metrics_resp = client.get("/api/v1/monitoring/metrics", headers=headers)
    assert metrics_resp.status_code == 200
    data = metrics_resp.json()
    assert "recommendation_distribution" in data
    assert "override_trends" in data
    assert "alerts" in data

def test_policy_mapping(client, db):
    client.post("/api/v1/auth/register", json={
        "name": "Admin User",
        "email": "admin@aihiringguardian.demo",
        "password": "password123",
        "role": "ADMIN"
    })
    resp = client.post("/api/v1/auth/login", data={
        "username": "admin@aihiringguardian.demo",
        "password": "password123"
    })
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    tool_resp = client.post("/api/v1/ai-tools/", json={
        "name": "Test Mapper Tool",
        "vendor": "Test Vendor",
        "purpose": "Screening",
        "version": "1.0",
        "approval_status": "Approved"
    }, headers=headers)
    assert tool_resp.status_code == 200
    tool_id = tool_resp.json()["id"]
    
    # Create Policy
    pol_resp = client.post("/api/v1/policies/", json={
        "name": "Map Test Policy",
        "description": "Test map",
        "category": "Test",
        "status": "ACTIVE"
    }, headers=headers)
    assert pol_resp.status_code == 200
    pol_id = pol_resp.json()["id"]
    
    # Map Policy
    map_resp = client.post(f"/api/v1/policies/{pol_id}/map-tool/{tool_id}", headers=headers)
    assert map_resp.status_code == 200
    assert len(map_resp.json()["ai_tools"]) == 1
    assert map_resp.json()["ai_tools"][0]["id"] == tool_id
    
    # Unmap Policy
    unmap_resp = client.delete(f"/api/v1/policies/{pol_id}/map-tool/{tool_id}", headers=headers)
    assert unmap_resp.status_code == 200
    assert len(unmap_resp.json()["ai_tools"]) == 0

import uuid
def test_candidates_and_audit(client, db):
    client.post("/api/v1/auth/register", json={
        "name": "Admin User",
        "email": "admin@aihiringguardian.demo",
        "password": "password123",
        "role": "ADMIN"
    })
    resp = client.post("/api/v1/auth/login", data={
        "username": "admin@aihiringguardian.demo",
        "password": "password123"
    })
    assert resp.status_code == 200, resp.json()
    assert resp.status_code == 200, resp.json()
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create Candidate
    cand_resp = client.post("/api/v1/candidates/", json={
        "name": "Test Candidate",
        "email": "testcand@example.com",
        "phone": "1234567890",
        "target_role": "Tester",
        "education": "[]",
        "experience": "[]",
        "skills": '["Testing"]',
        "projects": "[]"
    }, headers=headers)
    assert cand_resp.status_code == 200, cand_resp.json()
    cand_id = cand_resp.json()["id"]
    
    # Record Consent
    cons_resp = client.post(f"/api/v1/candidates/{cand_id}/consent", json={
        "ai_screening_consent": True,
        "automated_interview_consent": True,
        "data_retention_consent": True,
        "communication_preferences": "Email"
    }, headers=headers)
    assert cons_resp.status_code == 200, cons_resp.json()
    
    # Get Candidates
    get_cand = client.get("/api/v1/candidates/", headers=headers)
    assert get_cand.status_code == 200
    assert len(get_cand.json()) >= 1
    assert get_cand.json()[-1]["id"] == cand_id
    assert get_cand.json()[-1]["name"] == "Test Candidate"
    
    # Get Audit
    audit_resp = client.get("/api/v1/audit/", headers=headers)
    assert audit_resp.status_code == 200
    audit_logs = audit_resp.json()
    assert len(audit_logs) >= 1
    assert audit_logs[0]["event_type"] in ["CANDIDATE_CREATED", "CONSENT_RECORDED", "CANDIDATE_DELETED", "POLICY_CREATED", "POLICY_MAPPED", "POLICY_UNMAPPED"]
