from groq import Groq
from config import settings

groq = Groq(api_key=settings.GROQ_API_KEY)
