import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/task_tracker')
    SECRET_KEY = os.getenv('SECRET_KEY', 'f999783df82223e99400bc901e99ebfd2c13a99ec8b14b56f602a2ff52daebde')


    # python -c "import secrets; print(secrets.token_hex(32))"
    #run this command to get your secret key