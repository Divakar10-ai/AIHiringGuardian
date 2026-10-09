from app.core.deps import get_current_admin_user
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from app.core.deps import get_db, get_current_admin_user
from app.models.all import Candidate, Consent, Evaluation, HumanReview, AITool, AuditLog, DecisionEvent
import csv
import io

router = APIRouter()

@router.get("/summary")
def get_compliance_summary(db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    # Candidate Metrics
    total_candidates = db.query(Candidate).count()
    candidates_with_consent = db.query(Consent).filter(Consent.consent_given == True).count()
    
    # Evaluation Metrics
    total_evaluations = db.query(Evaluation).count()
    candidates_evaluated = db.query(Evaluation.candidate_id).distinct().count()
    
    # Human Review Metrics
    total_reviews = db.query(HumanReview).count()
    overrides = db.query(HumanReview).filter(HumanReview.override == True).count()
    accepted = total_reviews - overrides
    pending_reviews = total_evaluations - total_reviews
    
    # Decisions count
    shortlist_count = db.query(HumanReview).filter(HumanReview.final_decision == "Shortlist").count()
    hold_count = db.query(HumanReview).filter(HumanReview.final_decision == "Hold").count()
    reject_count = db.query(HumanReview).filter(HumanReview.final_decision == "Reject").count()
    
    override_rate = round((overrides / total_evaluations) * 100, 1) if total_evaluations > 0 else 0.0

    # AI Governance Table
    ai_tools = db.query(AITool).all()
    ai_governance_table = []
    for tool in ai_tools:
        evals_count = db.query(Evaluation).filter(Evaluation.ai_tool_id == tool.id).count()
        ai_governance_table.append({
            "id": tool.id,
            "name": tool.name,
            "vendor": tool.vendor,
            "version": tool.version,
            "approval_status": tool.approval_status,
            "risk_level": tool.risk_level,
            "evaluations": evals_count
        })

    # Decision Table
    decisions_table = []
    evals = db.query(Evaluation).all()
    for e in evals:
        hr = db.query(HumanReview).filter(HumanReview.evaluation_id == e.id).first()
        decisions_table.append({
            "candidate_id": e.candidate_id,
            "ai_recommendation": e.recommendation,
            "human_decision": hr.final_decision if hr else "Pending",
            "override": hr.override if hr else False,
            "override_reason": hr.override_reason if hr else None,
            "date": hr.reviewed_at.isoformat() if hr else e.created_at.isoformat()
        })

    # Recent Audit Activity
    recent_audit = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(10).all()
    audit_activity = []
    for a in recent_audit:
        audit_activity.append({
            "id": a.id,
            "timestamp": a.timestamp.isoformat(),
            "event_type": a.event_type,
            "description": a.description,
            "actor": a.actor_id,
            "candidate_id": a.candidate_id
        })

    return {
        "metrics": {
            "total_candidates": total_candidates,
            "candidates_with_consent": candidates_with_consent,
            "candidates_evaluated": candidates_evaluated,
            "total_evaluations": total_evaluations,
            "total_reviews": total_reviews,
            "overrides": overrides,
            "accepted": accepted,
            "pending_reviews": pending_reviews,
            "override_rate": override_rate,
            "decisions": {
                "shortlist": shortlist_count,
                "hold": hold_count,
                "reject": reject_count
            }
        },
        "ai_tools": ai_governance_table,
        "decisions": decisions_table,
        "audit_activity": audit_activity
    }

@router.get("/export-csv")
def export_compliance_csv(db: Session = Depends(get_db), current_user = Depends(get_current_admin_user)):
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow([
        "Candidate ID", "AI Tool", "AI Recommendation", "AI Score",
        "Confidence", "Human Decision", "Override Status", "Override Reason", "Timestamp"
    ])
    
    evals = db.query(Evaluation).all()
    for e in evals:
        hr = db.query(HumanReview).filter(HumanReview.evaluation_id == e.id).first()
        tool = db.query(AITool).filter(AITool.id == e.ai_tool_id).first()
        tool_name = tool.name if tool else "Unknown"
        
        # safely extract confidence if available in factors
        conf = ""
        if e.factors and isinstance(e.factors, dict):
            conf = e.factors.get("confidence", "")
            
        writer.writerow([
            e.candidate_id,
            tool_name,
            e.recommendation,
            e.score,
            conf,
            hr.final_decision if hr else "Pending",
            "YES" if hr and hr.override else "NO",
            hr.override_reason if hr else "",
            hr.reviewed_at.isoformat() if hr else e.created_at.isoformat()
        ])
        
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=compliance_report.csv"}
    )
