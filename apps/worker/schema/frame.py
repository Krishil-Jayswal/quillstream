from pydantic import BaseModel
from typing import List

class SelectedFrames(BaseModel):
    frames: List[str]
    