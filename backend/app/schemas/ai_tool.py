from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AIToolBase(BaseModel):
    name: str
    vendor: str
    purpose: str
    version: str
    approval_status: str # e.g., 'Approved', 'Pending Review', 'Rejected'
    hiring_stage: Optional[str] = None
    risk_level: Optional[str] = None

class AIToolCreate(AIToolBase):
    pass

class AIToolUpdate(AIToolBase):
    pass

class AITool(AIToolBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
