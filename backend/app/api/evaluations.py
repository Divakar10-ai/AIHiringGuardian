from app.core.deps import get_current_user
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.schemas.evaluation import Evaluation, EvaluationCreate, HumanReviewCreate, HumanReview
from app.core.deps import get_db, get_current_user, get_current_reviewer_user
from app.services import evaluation_service
from app.models.all import User

router = APIRouter()

def serialize_evaluation(e):
    return {
        "id": e.id,
        "candidate_id": e.candidate_id,
        "candidate_name": e.candidate.name if e.candidate else None,
        "ai_tool_id": e.ai_tool_id,
        "ai_tool_name": e.ai_tool.name if e.ai_tool else None,
        "workflow_stage": e.ai_tool.hiring_stage if e.ai_tool else "Unknown",
        "model_version": e.ai_tool.version if e.ai_tool else None,
        "recommendation": e.recommendation,
        "score": e.score,
        "explanation": e.factors,
        "status": e.status,
        "timestamp": e.created_at,
        "human_review": {
            "id": e.human_review.id,
            "evaluation_id": e.human_review.evaluation_id,
            "reviewer_id": e.human_review.reviewer_id,
            "original_recommendation": e.human_review.original_recommendation,
            "final_decision": e.human_review.final_decision,
            "reviewed_at": e.human_review.reviewed_at,
            "reviewed_by": e.human_review.reviewer.name if e.human_review.reviewer else None,
            "override": e.human_review.override,
            "override_reason": e.human_review.override_reason,
            "notes": e.human_review.override_reason or "",
            "decision": e.human_review.final_decision
        } if e.human_review else None
    }

@router.get("/", response_model=List[Evaluation])
def get_evaluations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Retrieve all candidate AI evaluations."""
    evals = evaluation_service.get_evaluations(db, skip=skip, limit=limit)
    return [serialize_evaluation(e) for e in evals]

@router.get("/{evaluation_id}", response_model=Evaluation)
def get_evaluation(evaluation_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Retrieve a specific AI evaluation."""
    e = evaluation_service.get_evaluation(db, evaluation_id)
    if not e:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return serialize_evaluation(e)

@router.post("/", response_model=Evaluation)
def create_evaluation(
    eval_in: EvaluationCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_reviewer_user)
):
    try:
        e = evaluation_service.create_evaluation(db, eval_in, current_user.id)
        return serialize_evaluation(e)
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))

@router.post("/{eval_id}/review", response_model=Evaluation)
def submit_human_review(
    eval_id: int, 
    review: HumanReviewCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_reviewer_user)
):
    """Submit a human review for an AI evaluation."""
    try:
        evaluation_service.submit_human_review(db, eval_id, review, current_user.id)
        e = evaluation_service.get_evaluation(db, eval_id)
        return serialize_evaluation(e)
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))
