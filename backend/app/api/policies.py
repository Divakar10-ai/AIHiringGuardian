from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.deps import get_db, get_current_user, get_current_admin_user
from app.models.all import Policy, AuditLog, User
from app.schemas.policy import Policy as PolicySchema, PolicyCreate

router = APIRouter()

@router.get("/", response_model=List[PolicySchema])
def get_policies(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Policy).all()

@router.post("/", response_model=PolicySchema)
def create_policy(
    policy_in: PolicyCreate, 
    db: Session = Depends(get_db), 
    current_admin: User = Depends(get_current_admin_user)
):
    new_policy = Policy(
        name=policy_in.name,
        description=policy_in.description,
        category=policy_in.category,
        status=policy_in.status
    )
    db.add(new_policy)
    db.commit()
    db.refresh(new_policy)
    
    # Audit log
    audit = AuditLog(
        event_type="POLICY_CREATED",
        actor_id=current_admin.id,
        description=f"Policy '{new_policy.name}' created in category '{new_policy.category}'.",
        metadata_={"policy_id": new_policy.id, "status": new_policy.status}
    )
    db.add(audit)
    db.commit()
    
    return new_policy

@router.post("/{policy_id}/map-tool/{ai_tool_id}", response_model=PolicySchema)
def map_policy_to_tool(
    policy_id: int,
    ai_tool_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    from app.models.all import AITool
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
        
    ai_tool = db.query(AITool).filter(AITool.id == ai_tool_id).first()
    if not ai_tool:
        raise HTTPException(status_code=404, detail="AI Tool not found")
        
    if ai_tool in policy.ai_tools:
        raise HTTPException(status_code=400, detail="AI Tool already mapped to this policy")
        
    policy.ai_tools.append(ai_tool)
    
    audit = AuditLog(
        event_type="POLICY_MAPPED",
        actor_id=current_admin.id,
        ai_tool_id=ai_tool.id,
        description=f"Mapped Policy '{policy.name}' to AI Tool '{ai_tool.name}'.",
        metadata_={"policy_id": policy.id, "ai_tool_id": ai_tool.id}
    )
    db.add(audit)
    db.commit()
    db.refresh(policy)
    return policy

@router.delete("/{policy_id}/map-tool/{ai_tool_id}", response_model=PolicySchema)
def remove_policy_mapping(
    policy_id: int,
    ai_tool_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    from app.models.all import AITool
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
        
    ai_tool = db.query(AITool).filter(AITool.id == ai_tool_id).first()
    if not ai_tool:
        raise HTTPException(status_code=404, detail="AI Tool not found")
        
    if ai_tool not in policy.ai_tools:
        raise HTTPException(status_code=400, detail="AI Tool is not mapped to this policy")
        
    policy.ai_tools.remove(ai_tool)
    
    audit = AuditLog(
        event_type="POLICY_UNMAPPED",
        actor_id=current_admin.id,
        ai_tool_id=ai_tool.id,
        description=f"Unmapped Policy '{policy.name}' from AI Tool '{ai_tool.name}'.",
        metadata_={"policy_id": policy.id, "ai_tool_id": ai_tool.id}
    )
    db.add(audit)
    db.commit()
    db.refresh(policy)
    return policy
