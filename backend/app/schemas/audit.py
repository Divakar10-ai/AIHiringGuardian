from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class AuditLogBase(BaseModel):
    event_type: str
    description: str
    candidate_id: Optional[str] = None
    ai_tool_id: Optional[int] = None
    evaluation_id: Optional[int] = None
    actor_id: Optional[int] = None

class AuditLog(AuditLogBase):
    id: int
    timestamp: datetime
    metadata_: Optional[Dict[str, Any]] = None
    actor: Optional[str] = None
    severity: str = "INFO"

    class Config:
        from_attributes = True
