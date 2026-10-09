from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class Explanation(BaseModel):
    factors_considered: List[str]
    confidence_score: float

class HumanReviewBase(BaseModel):
    decision: str # 'Accepted', 'Modified', 'Overridden'
    notes: Optional[str] = None
    override: bool = False
    override_reason: Optional[str] = None

class HumanReviewCreate(HumanReviewBase):
    pass

class HumanReview(HumanReviewBase):
    id: int
    evaluation_id: int
    reviewer_id: int
    original_recommendation: str
    final_decision: str
    reviewed_at: datetime
    reviewed_by: Optional[str] = None # Will populate from User relation

    class Config:
        from_attributes = True

class EvaluationBase(BaseModel):
    candidate_id: str
    ai_tool_id: int
    workflow_stage: Optional[str] = None

class EvaluationCreate(EvaluationBase):
    pass

class Evaluation(EvaluationBase):
    id: int
    candidate_name: Optional[str] = None
    ai_tool_name: Optional[str] = None
    model_version: Optional[str] = None
    recommendation: str
    score: float
    explanation: Explanation
    status: str
    timestamp: datetime
    human_review: Optional[HumanReview] = None

    class Config:
        from_attributes = True
