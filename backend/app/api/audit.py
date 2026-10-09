from app.core.deps import get_current_admin_user
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.schemas.audit import AuditLog
from app.core.deps import get_db, get_current_admin_user
from app.models.all import AuditLog as AuditLogModel
from app.models.all import User

router = APIRouter()

@router.get("/", response_model=List[AuditLog])
def get_audit_logs(
    candidate_id: Optional[str] = None,
    ai_tool_id: Optional[int] = None,
    event_type: Optional[str] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Retrieve audit trail logs."""
    query = db.query(AuditLogModel)
    if candidate_id:
        query = query.filter(AuditLogModel.candidate_id == candidate_id)
    if ai_tool_id:
        query = query.filter(AuditLogModel.ai_tool_id == ai_tool_id)
    if event_type:
        query = query.filter(AuditLogModel.event_type == event_type)
        
    logs = query.order_by(AuditLogModel.timestamp.desc()).offset(skip).limit(limit).all()
    
    # Map back the required fields to match what frontend expects
    res = []
    for log in logs:
        # Determine severity based on event type
        severity = "INFO"
        if log.event_type in ["POLICY_VIOLATION_DETECTED", "HUMAN_REVIEW_OVERRIDE"]:
            severity = "WARNING"
            
        actor_name = "System"
        if log.actor_id:
            actor = db.query(User).filter(User.id == log.actor_id).first()
            if actor:
                actor_name = actor.name
                
        res.append({
            "id": log.id,
            "event_type": log.event_type,
            "description": log.description,
            "severity": severity,
            "actor": actor_name,
            "timestamp": log.timestamp,
            "candidate_id": log.candidate_id,
            "ai_tool_id": log.ai_tool_id,
            "evaluation_id": log.evaluation_id,
            "metadata_": log.metadata_
        })
    return res

@router.get("/{audit_id}", response_model=AuditLog)
def get_audit_log(
    audit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    log = db.query(AuditLogModel).filter(AuditLogModel.id == audit_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Audit log not found")
        
    severity = "INFO"
    if log.event_type in ["POLICY_VIOLATION_DETECTED", "HUMAN_REVIEW_OVERRIDE"]:
        severity = "WARNING"
        
    actor_name = "System"
    if log.actor_id:
        actor = db.query(User).filter(User.id == log.actor_id).first()
        if actor:
            actor_name = actor.name
            
    return {
        "id": log.id,
        "event_type": log.event_type,
        "description": log.description,
        "severity": severity,
        "actor": actor_name,
        "timestamp": log.timestamp,
        "candidate_id": log.candidate_id,
        "ai_tool_id": log.ai_tool_id,
        "evaluation_id": log.evaluation_id,
        "metadata_": log.metadata_
    }
