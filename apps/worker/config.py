from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ABS_CONNECTION_URL: str = "azure storage connection url"
    ABS_CONTAINER_NAME: str = "azure storage connectainer name"
    ABS_UPLOAD_CONTAINER_NAME: str = "azure storage video uploads connectainer name"
    VIDEO_ID: str = "video id"
    VIDEO_NAME: str = "video name"
    GROQ_API_KEY: str = "groq cloud api key"
    OLLAMA_API_KEY: str = "ollama cloud api key"
    UPSTASH_REDIS_REST_URL: str = "upstash redis url"
    UPSTASH_REDIS_REST_TOKEN: str = "upstash redis token"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
