from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PolicyBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    status: str

class PolicyCreate(PolicyBase):
    pass

class Policy(PolicyBase):
    id: int
    created_at: datetime
    updated_at: datetime
    ai_tools: list['AITool'] = []

    class Config:
        from_attributes = True

from app.schemas.ai_tool import AITool
Policy.model_rebuild()
