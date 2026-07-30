from pydantic import BaseModel


class ServiceResponse(BaseModel):
    id: str
    name: str
    description: str | None = None
    is_active: bool
