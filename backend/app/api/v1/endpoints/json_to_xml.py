from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.json_to_xml_schema import JsonToXmlRequest
from app.workers.json_to_xml import json_to_xml_task
from app.api.v1.endpoints.tool_helpers import queue_file_tool


router = APIRouter(prefix="/tools", tags=["JSON To XML"])


@router.post("/json-to-xml")
def json_to_xml(payload: JsonToXmlRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return queue_file_tool(db, current_user, payload.file_id, "json_to_xml", json_to_xml_task)
