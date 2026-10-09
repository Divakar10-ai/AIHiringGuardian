from app.core.deps import get_current_user, get_current_admin_user
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.schemas.candidate import Candidate, CandidateCreate, CandidateUpdate, ConsentCreate, Consent
from app.core.deps import get_db, get_current_user, get_current_reviewer_user, get_current_admin_user
from app.services import candidate_service
from app.models.all import User

router = APIRouter()

@router.get("/", response_model=List[Candidate])
def get_candidates(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Retrieve all candidate governance records."""
    db_cands = candidate_service.get_candidates(db, skip=skip, limit=limit)
    for c in db_cands:
        c.notices_sent = ["AI Privacy Policy v2.1", "Bias Mitigation Disclosure"] if c.consent else []
        c.consent_status = None
        if c.consent:
            c.consent_status = {
                "id": c.consent.id,
                "candidate_id": c.id,
                "ai_screening_consent": c.consent.consent_given,
                "automated_interview_consent": c.consent.screening_notice_acknowledged,
                "data_retention_consent": True,
                "communication_preferences": c.consent.communication_preferences,
                "consented_at": c.consent.timestamp
            }
    return db_cands

@router.post("/", response_model=Candidate)
def create_candidate(
    candidate_in: CandidateCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_reviewer_user)
):
    try:
        return candidate_service.create_candidate(db, candidate_in, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{candidate_id}", response_model=Candidate)
def get_candidate(candidate_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_obj = candidate_service.get_candidate(db, candidate_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    db_obj.notices_sent = ["AI Privacy Policy v2.1", "Bias Mitigation Disclosure"] if db_obj.consent else []
    db_obj.consent_status = None
    if db_obj.consent:
        db_obj.consent_status = {
            "id": db_obj.consent.id,
            "candidate_id": db_obj.id,
            "ai_screening_consent": db_obj.consent.consent_given,
            "automated_interview_consent": db_obj.consent.screening_notice_acknowledged,
            "data_retention_consent": True,
            "communication_preferences": db_obj.consent.communication_preferences,
            "consented_at": db_obj.consent.timestamp
        }
    return db_obj

@router.put("/{candidate_id}", response_model=Candidate)
def update_candidate(
    candidate_id: str, 
    candidate_in: CandidateUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_reviewer_user)
):
    db_obj = candidate_service.update_candidate(db, candidate_id, candidate_in, current_user.id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return db_obj

@router.post("/{candidate_id}/consent", response_model=Consent)
def record_consent(
    candidate_id: str, 
    consent_in: ConsentCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_reviewer_user)
):
    candidate = candidate_service.get_candidate(db, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    db_consent = candidate_service.record_consent(db, candidate_id, consent_in, current_user.id)
    return {
        "id": db_consent.id,
        "candidate_id": candidate_id,
        "ai_screening_consent": db_consent.consent_given,
        "automated_interview_consent": db_consent.screening_notice_acknowledged,
        "data_retention_consent": True,
        "communication_preferences": db_consent.communication_preferences,
        "consented_at": db_consent.timestamp
    }

@router.get("/{candidate_id}/consent", response_model=Consent)
def get_consent(candidate_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_consent = candidate_service.get_consent(db, candidate_id)
    if not db_consent:
        raise HTTPException(status_code=404, detail="Consent not found")
    return {
        "id": db_consent.id,
        "candidate_id": candidate_id,
        "ai_screening_consent": db_consent.consent_given,
        "automated_interview_consent": db_consent.screening_notice_acknowledged,
        "data_retention_consent": True,
        "communication_preferences": db_consent.communication_preferences,
        "consented_at": db_consent.timestamp
    }

@router.get("/{candidate_id}/decision-replay")
def get_decision_replay(candidate_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    from app.models.all import DecisionEvent
    events = db.query(DecisionEvent).filter(DecisionEvent.candidate_id == candidate_id).order_by(DecisionEvent.sequence_number.asc()).all()
    return events
