from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str

class User(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True
