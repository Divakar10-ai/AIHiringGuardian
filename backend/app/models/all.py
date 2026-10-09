from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text, JSON, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.core import Base

policy_tool_mapping = Table(
    "policy_tool_mapping",
    Base.metadata,
    Column("policy_id", Integer, ForeignKey("policies.id", ondelete="CASCADE"), primary_key=True),
    Column("ai_tool_id", Integer, ForeignKey("ai_tools.id", ondelete="CASCADE"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String) # ADMIN, HR_REVIEWER, AUDITOR
    created_at = Column(DateTime, default=datetime.utcnow)

class Candidate(Base):
    __tablename__ = "candidates"
    id = Column(String, primary_key=True, index=True) # e.g., CAND-001
    candidate_code = Column(String, unique=True, index=True)
    name = Column(String)
    email = Column(String)
    phone = Column(String, nullable=True)
    target_role = Column(String)
    education = Column(Text, nullable=True)
    experience = Column(Text, nullable=True)
    skills = Column(Text, nullable=True)
    projects = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    consent = relationship("Consent", back_populates="candidate", uselist=False)
    evaluations = relationship("Evaluation", back_populates="candidate")

class Consent(Base):
    __tablename__ = "consents"
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(String, ForeignKey("candidates.id"), unique=True)
    consent_given = Column(Boolean, default=False)
    screening_notice_acknowledged = Column(Boolean, default=False)
    communication_preferences = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("Candidate", back_populates="consent")

class AITool(Base):
    __tablename__ = "ai_tools"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    vendor = Column(String)
    version = Column(String)
    purpose = Column(String)
    hiring_stage = Column(String, nullable=True)
    approval_status = Column(String)
    risk_level = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    evaluations = relationship("Evaluation", back_populates="ai_tool")
    policies = relationship("Policy", secondary=policy_tool_mapping, back_populates="ai_tools")

class Evaluation(Base):
    __tablename__ = "evaluations"
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(String, ForeignKey("candidates.id"))
    ai_tool_id = Column(Integer, ForeignKey("ai_tools.id"))
    score = Column(Float)
    confidence = Column(Float)
    recommendation = Column(String)
    factors = Column(JSON)
    evidence = Column(Text, nullable=True)
    status = Column(String, default="PENDING_REVIEW")
    created_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("Candidate", back_populates="evaluations")
    ai_tool = relationship("AITool", back_populates="evaluations")
    human_review = relationship("HumanReview", back_populates="evaluation", uselist=False)

class HumanReview(Base):
    __tablename__ = "human_reviews"
    id = Column(Integer, primary_key=True, index=True)
    evaluation_id = Column(Integer, ForeignKey("evaluations.id"), unique=True)
    reviewer_id = Column(Integer, ForeignKey("users.id"))
    original_recommendation = Column(String)
    final_decision = Column(String)
    override = Column(Boolean, default=False)
    override_reason = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, default=datetime.utcnow)

    evaluation = relationship("Evaluation", back_populates="human_review")
    reviewer = relationship("User")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, index=True)
    candidate_id = Column(String, ForeignKey("candidates.id"), nullable=True)
    ai_tool_id = Column(Integer, ForeignKey("ai_tools.id"), nullable=True)
    evaluation_id = Column(Integer, ForeignKey("evaluations.id"), nullable=True)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    description = Column(String)
    metadata_ = Column("metadata", JSON, nullable=True)

class DecisionEvent(Base):
    __tablename__ = "decision_events"
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(String, ForeignKey("candidates.id"))
    event_type = Column(String)
    sequence_number = Column(Integer)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    payload = Column(JSON)

class Policy(Base):
    __tablename__ = "policies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    category = Column(String) # e.g., 'AI Bias', 'Data Privacy', 'EU AI Act'
    status = Column(String) # e.g., 'ACTIVE', 'DRAFT', 'DEPRECATED'
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    ai_tools = relationship("AITool", secondary=policy_tool_mapping, back_populates="policies")
