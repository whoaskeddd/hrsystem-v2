from pydantic import BaseModel


class AdminReport(BaseModel):
    id: str
    title: str
    status: str


class ReportStatusPatch(BaseModel):
    status: str
