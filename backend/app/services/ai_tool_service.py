from sqlalchemy.orm import Session
from app.models.all import AITool
from app.schemas.ai_tool import AIToolCreate, AIToolUpdate
from app.services.audit_service import log_audit_event

def get_ai_tool(db: Session, tool_id: int):
    return db.query(AITool).filter(AITool.id == tool_id).first()

def get_ai_tools(db: Session, skip: int = 0, limit: int = 100):
    return db.query(AITool).offset(skip).limit(limit).all()

def create_ai_tool(db: Session, tool_in: AIToolCreate, user_id: int):
    db_obj = AITool(
        name=tool_in.name,
        vendor=tool_in.vendor,
        purpose=tool_in.purpose,
        version=tool_in.version,
        approval_status=tool_in.approval_status,
        hiring_stage=tool_in.hiring_stage,
        risk_level=tool_in.risk_level
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    log_audit_event(
        db=db,
        event_type="AI_TOOL_REGISTERED",
        description=f"AI Tool {db_obj.name} (v{db_obj.version}) registered.",
        ai_tool_id=db_obj.id,
        actor_id=user_id,
        metadata={"vendor": db_obj.vendor, "approval_status": db_obj.approval_status}
    )
    return db_obj

def update_ai_tool(db: Session, tool_id: int, tool_in: AIToolUpdate, user_id: int):
    db_obj = get_ai_tool(db, tool_id)
    if not db_obj:
        return None
    for var, value in vars(tool_in).items():
        setattr(db_obj, var, value) if value is not None else None
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    log_audit_event(
        db=db,
        event_type="AI_TOOL_UPDATED",
        description=f"AI Tool {db_obj.name} updated.",
        ai_tool_id=db_obj.id,
        actor_id=user_id
    )
    return db_obj
