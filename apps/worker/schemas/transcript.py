from pydantic import BaseModel
from typing import List


class Segment(BaseModel):
    text: str
    start: int
    end: int


class Transcript(BaseModel):
    segments: List[Segment]
