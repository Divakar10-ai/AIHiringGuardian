import uuid
from sqlalchemy.orm import Session
from app.models.all import Candidate, Consent
from app.schemas.candidate import CandidateCreate, CandidateUpdate, ConsentCreate
from app.services.audit_service import log_audit_event, record_decision_event

def create_candidate(db: Session, candidate_in: CandidateCreate, user_id: int):
    # Check for duplicate candidate by email
    existing_candidate = db.query(Candidate).filter(Candidate.email == candidate_in.email).first()
    if existing_candidate:
        raise ValueError("A candidate with this email already exists.")

    candidate_id = f"CAND-{uuid.uuid4().hex[:8].upper()}"
    candidate_code = str(uuid.uuid4())
    
    db_obj = Candidate(
        id=candidate_id,
        candidate_code=candidate_code,
        name=candidate_in.name,
        email=candidate_in.email,
        phone=candidate_in.phone,
        target_role=candidate_in.target_role,
        education=candidate_in.education,
        experience=candidate_in.experience,
        skills=candidate_in.skills,
        projects=candidate_in.projects
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    log_audit_event(
        db=db,
        event_type="CANDIDATE_CREATED",
        description=f"Candidate {db_obj.name} created.",
        candidate_id=db_obj.id,
        actor_id=user_id,
        metadata={"email": db_obj.email, "role": db_obj.target_role}
    )
    record_decision_event(
        db=db,
        candidate_id=db_obj.id,
        event_type="CANDIDATE_CREATED",
        payload={"name": db_obj.name, "target_role": db_obj.target_role},
        actor_id=user_id
    )
    return db_obj

def get_candidate(db: Session, candidate_id: str):
    return db.query(Candidate).filter(Candidate.id == candidate_id).first()

def get_candidates(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Candidate).offset(skip).limit(limit).all()

def update_candidate(db: Session, candidate_id: str, candidate_in: CandidateUpdate, user_id: int):
    db_obj = get_candidate(db, candidate_id)
    if not db_obj:
        return None
    for var, value in vars(candidate_in).items():
        setattr(db_obj, var, value) if value is not None else None
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def record_consent(db: Session, candidate_id: str, consent_in: ConsentCreate, user_id: int):
    db_obj = db.query(Consent).filter(Consent.candidate_id == candidate_id).first()
    if not db_obj:
        db_obj = Consent(candidate_id=candidate_id)
    
    db_obj.consent_given = consent_in.ai_screening_consent
    db_obj.screening_notice_acknowledged = consent_in.automated_interview_consent
    db_obj.communication_preferences = consent_in.communication_preferences
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    log_audit_event(
        db=db,
        event_type="CONSENT_RECORDED",
        description=f"Consent recorded for candidate {candidate_id}.",
        candidate_id=candidate_id,
        actor_id=user_id,
        metadata={"ai_screening_consent": consent_in.ai_screening_consent}
    )
    record_decision_event(
        db=db,
        candidate_id=candidate_id,
        event_type="CONSENT_RECORDED",
        payload={"ai_screening_consent": consent_in.ai_screening_consent},
        actor_id=user_id
    )
    return db_obj

def get_consent(db: Session, candidate_id: str):
    return db.query(Consent).filter(Consent.candidate_id == candidate_id).first()
