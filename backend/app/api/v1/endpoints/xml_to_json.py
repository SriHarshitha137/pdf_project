from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.xml_to_json_schema import XmlToJsonRequest
from app.workers.xml_to_json import xml_to_json_task
from app.api.v1.endpoints.tool_helpers import queue_file_tool


router = APIRouter(prefix="/tools", tags=["XML To JSON"])


@router.post("/xml-to-json")
def xml_to_json(payload: XmlToJsonRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return queue_file_tool(db, current_user, payload.file_id, "xml_to_json", xml_to_json_task)
