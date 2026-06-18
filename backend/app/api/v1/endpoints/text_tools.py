from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.text_tools_schema import TextToolRequest
from app.workers.text_tools import (
    base64_to_text_task,
    lowercase_to_uppercase_task,
    text_to_base64_task,
    text_to_title_case_task,
    uppercase_to_lowercase_task,
    url_decode_task,
    url_encode_task
)
from app.api.v1.endpoints.tool_helpers import queue_text_tool


router = APIRouter(prefix="/tools", tags=["Text Tools"])


@router.post("/uppercase-to-lowercase")
def uppercase_to_lowercase(payload: TextToolRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return queue_text_tool(db, current_user, "uppercase_to_lowercase", uppercase_to_lowercase_task, {"text": payload.text})


@router.post("/lowercase-to-uppercase")
def lowercase_to_uppercase(payload: TextToolRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return queue_text_tool(db, current_user, "lowercase_to_uppercase", lowercase_to_uppercase_task, {"text": payload.text})


@router.post("/text-to-title-case")
def text_to_title_case(payload: TextToolRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return queue_text_tool(db, current_user, "text_to_title_case", text_to_title_case_task, {"text": payload.text})


@router.post("/text-to-base64")
def text_to_base64(payload: TextToolRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return queue_text_tool(db, current_user, "text_to_base64", text_to_base64_task, {"text": payload.text})


@router.post("/base64-to-text")
def base64_to_text(payload: TextToolRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return queue_text_tool(db, current_user, "base64_to_text", base64_to_text_task, {"text": payload.text})


@router.post("/url-encode")
def url_encode(payload: TextToolRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return queue_text_tool(db, current_user, "url_encode", url_encode_task, {"text": payload.text})


@router.post("/url-decode")
def url_decode(payload: TextToolRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return queue_text_tool(db, current_user, "url_decode", url_decode_task, {"text": payload.text})
