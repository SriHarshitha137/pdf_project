from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.yaml_to_json_schema import YamlToJsonRequest
from app.workers.yaml_to_json import yaml_to_json_task
from app.api.v1.endpoints.tool_helpers import queue_file_tool


router = APIRouter(prefix="/tools", tags=["YAML To JSON"])


@router.post("/yaml-to-json")
def yaml_to_json(payload: YamlToJsonRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return queue_file_tool(db, current_user, payload.file_id, "yaml_to_json", yaml_to_json_task)
