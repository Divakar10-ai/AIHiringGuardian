from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class ConsentBase(BaseModel):
    ai_screening_consent: bool
    automated_interview_consent: bool
    data_retention_consent: bool
    communication_preferences: str

class ConsentCreate(ConsentBase):
    pass

class Consent(ConsentBase):
    id: int
    candidate_id: str
    consented_at: datetime
    
    class Config:
        from_attributes = True

class CandidateBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    target_role: str
    education: Optional[str] = None
    experience: Optional[str] = None
    skills: Optional[str] = None
    projects: Optional[str] = None

class CandidateCreate(CandidateBase):
    pass

class CandidateUpdate(CandidateBase):
    pass

class Candidate(CandidateBase):
    id: str
    candidate_code: str
    created_at: datetime
    updated_at: datetime
    consent_status: Optional[Consent] = None
    notices_sent: List[str] = [] # Keeping this for frontend compatibility if needed

    class Config:
        from_attributes = True
