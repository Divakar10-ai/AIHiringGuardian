from app.core.deps import get_current_admin_user
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.schemas.ai_tool import AITool, AIToolCreate, AIToolUpdate
from app.core.deps import get_db, get_current_user, get_current_admin_user
from app.services import ai_tool_service
from app.models.all import User

router = APIRouter()

@router.get("/", response_model=List[AITool])
def get_ai_tools(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    """Retrieve all AI models/tools in the registry."""
    return ai_tool_service.get_ai_tools(db, skip=skip, limit=limit)

@router.post("/", response_model=AITool)
def register_ai_tool(
    tool_in: AIToolCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Register a new AI tool for governance review."""
    return ai_tool_service.create_ai_tool(db, tool_in, current_user.id)

@router.get("/{tool_id}", response_model=AITool)
def get_ai_tool(tool_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    db_obj = ai_tool_service.get_ai_tool(db, tool_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="AI Tool not found")
    return db_obj

@router.put("/{tool_id}", response_model=AITool)
def update_ai_tool(
    tool_id: int, 
    tool_in: AIToolUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_obj = ai_tool_service.update_ai_tool(db, tool_id, tool_in, current_user.id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="AI Tool not found")
    return db_obj
