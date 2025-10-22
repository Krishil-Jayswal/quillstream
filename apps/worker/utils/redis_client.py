import json
from config import settings
from upstash_redis import Redis
from typing import Literal, Optional
from datetime import datetime, timezone


class RedisClient:
    def __init__(self, video_id: str):
        quillstream = "quillstream"
        self.video_id = video_id
        self.redis = Redis(
            url=settings.UPSTASH_REDIS_REST_URL, token=settings.UPSTASH_REDIS_REST_TOKEN
        )
        self.status_key = f"{quillstream}:status:{video_id}"
        self.logs_key = f"{quillstream}:logs:{video_id}"
        self.jobs_stream_key = f"{quillstream}:jobs"

    def log(
        self,
        message: str,
        level: Literal["Info", "Error"],
        status: Optional[Literal["Completed", "FAILED"]] = None,
    ):
        pipeline = self.redis.multi()
        pipeline.lpush(
            self.logs_key,
            json.dumps(
                {
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "level": level,
                    "message": message,
                }
            ),
        )
        if status:
            pipeline.execute(
                [
                    "XADD",
                    self.jobs_stream_key,
                    "*",
                    "id",
                    self.video_id,
                    "status",
                    status,
                ]
            )
            pipeline.set(self.status_key, status)
        pipeline.exec()
