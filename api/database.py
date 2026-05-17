import os

from dotenv import load_dotenv
from pymongo import AsyncMongoClient

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DB = os.getenv("MONGODB_DB", "bodyaxis")

client = AsyncMongoClient(MONGODB_URI)
db = client[MONGODB_DB]
