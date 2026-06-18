from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import requests as http_requests
import secrets

from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserResponse, UserLogin
from app.schemas.google_auth_schema import GoogleAuthRequest
from app.core.security import hash_password, verify_password, create_access_token, get_current_user


router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserResponse)
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = User(
        email=user.email,
        hashed_password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):
    db_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if not verify_password(
        user.password,
        db_user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    token = create_access_token(
        {"sub": db_user.email}
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "plan_type": current_user.plan_type
    }


@router.post("/google")
def google_login(
    payload: GoogleAuthRequest,
    db: Session = Depends(get_db)
):
    resp = http_requests.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        headers={"Authorization": f"Bearer {payload.token}"}
    )

    if resp.status_code != 200:
        raise HTTPException(
            status_code=401,
            detail="Invalid Google token"
        )

    user_info = resp.json()
    email = user_info.get("email")

    if not email:
        raise HTTPException(
            status_code=400,
            detail="Google account has no email"
        )

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        user = User(
            email=email,
            hashed_password=hash_password(
                secrets.token_hex(32)
            )
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": user.email})

    return {
        "access_token": token,
        "token_type": "bearer"
    }