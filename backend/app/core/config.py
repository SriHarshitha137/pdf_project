from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    REDIS_URL: str

    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    GROQ_API_KEY: str
    BASE_URL: str

    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str 
    POPPLER_PATH: str
    GHOSTSCRIPT_PATH: str
    GOOGLE_CLIENT_ID: str
    GFPGAN_MODEL_PATH: str | None = None
    MEDIAPIPE_FACE_STYLIZER_MODEL_PATH: str | None = None
    REAL_ESRGAN_EXE_PATH: str | None = None
    CALIBRE_PATH: str
    

    class Config:
        env_file = ".env"


settings = Settings()
