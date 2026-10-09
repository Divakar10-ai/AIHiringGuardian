from sqlalchemy.orm import Session
from app.models.all import Evaluation, Candidate, AITool, HumanReview
from app.schemas.evaluation import EvaluationCreate, HumanReviewCreate
from app.services.audit_service import log_audit_event, record_decision_event
import random

def create_evaluation(db: Session, eval_in: EvaluationCreate, user_id: int):
    # Fetch candidate to apply deterministic prototype logic
    candidate = db.query(Candidate).filter(Candidate.id == eval_in.candidate_id).first()
    if not candidate:
        raise ValueError("Candidate not found")
        
    ai_tool = db.query(AITool).filter(AITool.id == eval_in.ai_tool_id).first()
    if not ai_tool:
        raise ValueError("AI Tool not found")

    # Prototype evaluation logic
    score = 0.5
    factors = []
    
    if candidate.skills and len(candidate.skills) > 10:
        score += 0.2
        factors.append("Rich skill set detected")
    if candidate.experience and len(candidate.experience) > 10:
        score += 0.2
        factors.append("Sufficient experience detected")
    if candidate.education and len(candidate.education) > 5:
        score += 0.1
        factors.append("Education criteria met")
    
    score = min(score, 0.95)
    recommendation = "Proceed" if score >= 0.7 else "Reject"
    confidence = 0.8 + (random.random() * 0.1) # dummy confidence
    
    db_obj = Evaluation(
        candidate_id=eval_in.candidate_id,
        ai_tool_id=eval_in.ai_tool_id,
        score=score,
        confidence=confidence,
        recommendation=recommendation,
        factors={"factors_considered": factors, "confidence_score": confidence},
        evidence="Extracted from candidate profile text",
        status="PENDING_REVIEW"
    )
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    log_audit_event(
        db=db,
        event_type="EVALUATION_COMPLETED",
        description=f"AI Evaluation completed for candidate {candidate.id}.",
        candidate_id=candidate.id,
        ai_tool_id=ai_tool.id,
        evaluation_id=db_obj.id,
        actor_id=user_id,
        metadata={"score": score, "recommendation": recommendation}
    )
    record_decision_event(
        db=db,
        candidate_id=candidate.id,
        event_type="EVALUATION_COMPLETED",
        payload={"score": score, "recommendation": recommendation, "ai_tool_id": ai_tool.id},
        actor_id=user_id
    )
    
    return db_obj

def get_evaluations(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Evaluation).offset(skip).limit(limit).all()

def get_evaluation(db: Session, evaluation_id: int):
    return db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()

def submit_human_review(db: Session, evaluation_id: int, review_in: HumanReviewCreate, user_id: int):
    evaluation = get_evaluation(db, evaluation_id)
    if not evaluation:
        raise ValueError("Evaluation not found")
        
    if review_in.override and not review_in.override_reason:
        raise ValueError("Override reason MUST be provided when overriding AI recommendation")
        
    db_obj = HumanReview(
        evaluation_id=evaluation_id,
        reviewer_id=user_id,
        original_recommendation=evaluation.recommendation,
        final_decision=review_in.decision,
        override=review_in.override,
        override_reason=review_in.override_reason if review_in.override else None
    )
    db.add(db_obj)
    
    evaluation.status = "REVIEWED"
    db.add(evaluation)
    
    db.commit()
    db.refresh(db_obj)
    
    event_type = "HUMAN_REVIEW_OVERRIDE" if review_in.override else "HUMAN_REVIEW_ACCEPTED"
    desc = f"Human review submitted for evaluation {evaluation_id}. Decision: {review_in.decision}."
    if review_in.override:
        desc += f" Reason: {review_in.override_reason}"
        
    log_audit_event(
        db=db,
        event_type=event_type,
        description=desc,
        candidate_id=evaluation.candidate_id,
        ai_tool_id=evaluation.ai_tool_id,
        evaluation_id=evaluation.id,
        actor_id=user_id,
        metadata={"decision": review_in.decision, "override": review_in.override}
    )
    record_decision_event(
        db=db,
        candidate_id=evaluation.candidate_id,
        event_type=event_type,
        payload={"decision": review_in.decision, "override": review_in.override, "reason": review_in.override_reason},
        actor_id=user_id
    )
    
    return db_obj
