from sqlalchemy.orm import Session
from app.models.all import AuditLog, DecisionEvent
from typing import Optional, Dict, Any
import json

def log_audit_event(
    db: Session,
    event_type: str,
    description: str,
    candidate_id: Optional[str] = None,
    ai_tool_id: Optional[int] = None,
    evaluation_id: Optional[int] = None,
    actor_id: Optional[int] = None,
    metadata: Optional[Dict[str, Any]] = None,
):
    log = AuditLog(
        event_type=event_type,
        description=description,
        candidate_id=candidate_id,
        ai_tool_id=ai_tool_id,
        evaluation_id=evaluation_id,
        actor_id=actor_id,
        metadata_=metadata
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

def record_decision_event(
    db: Session,
    candidate_id: str,
    event_type: str,
    payload: Dict[str, Any],
    actor_id: Optional[int] = None,
):
    # get next sequence number
    last_event = db.query(DecisionEvent).filter(DecisionEvent.candidate_id == candidate_id).order_by(DecisionEvent.sequence_number.desc()).first()
    seq_num = (last_event.sequence_number + 1) if last_event else 1
    
    event = DecisionEvent(
        candidate_id=candidate_id,
        event_type=event_type,
        sequence_number=seq_num,
        actor_id=actor_id,
        payload=payload
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event
