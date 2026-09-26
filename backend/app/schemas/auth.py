from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class StudentRegistrationRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    usn: str
    phone: Optional[str] = None
    branch: Optional[str] = "Computer Science & Engineering"
    semester: Optional[int] = 5
    section: Optional[str] = "A"
    academic_year: Optional[str] = "2024-2025"
    emergency_contact: Optional[str] = None
    privacy_shield_active: Optional[bool] = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str
    admin_access_code: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict
