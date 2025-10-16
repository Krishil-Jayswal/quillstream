from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ABS_CONNECTION_URL: str = "azure storage connection url"
    ABS_CONTAINER_NAME: str = "azure storage connection name"
    VIDEO_ID: str = "video id"
    VIDEO_NAME: str = "video name"
    GROQ_API_KEY: str = "groq cloud api key"
    OLLAMA_API_KEY: str = "ollama cloud api key"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
