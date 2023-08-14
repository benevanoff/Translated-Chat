import os
from uuid import uuid4
from fastapi import FastAPI, Request, Depends, HTTPException, Response
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from translator import Translator
from starlette.middleware.sessions import SessionMiddleware
import pymysql

if os.environ.get("DB_PASSWORD") == None:
    print("!!!")
    quit()

sql_conn = pymysql.connect(
    host=os.environ['DB_HOST'],
    user='root',
    password=os.environ.get("DB_PASSWORD"),
    database='translated_chat',
    cursorclass=pymysql.cursors.DictCursor,
    autocommit=True
)

app = FastAPI()

# CORS configuration
origins = [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    f'http://{os.environ.get("HOST_IP", "127.0.0.1")}:3000'
]

# middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type","Set-Cookie"],
)
app.add_middleware(SessionMiddleware, secret_key="some-secret-key")

#eng_to_spa = Translator("eng")
spa_to_eng = Translator("spa")

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/login")
async def login(login_request:LoginRequest, request: Request):
    print(login_request.username)
    # first fetch the password from db to see if they match
    try:
        with sql_conn.cursor() as cursor:
            cursor.execute(f'SELECT password, native_language FROM users WHERE username = "{login_request.username}"') # NOT SAFE !!!
            results = cursor.fetchall()
            assert len(results) == 1
        if results[0]['password'] == login_request.password:
            request.session["username"] = login_request.username
            request.session["native_language"] = results[0]["native_language"]
            return {"success": True}
    except:
        pass # TODO handle better
    return {"success": False}

@app.get("/user_info/")
def get_user_info(request: Request):
    print(request.session)
    username = request.session.get("username")
    if username is None:
        return {"success": False}
    return {
        "success": True,
        "username": username,
        "language": request.session.get("native_language")
    }

class WordsRequest(BaseModel):
    words: str

#@app.post("/eng_to_spa")
#def translate_english_to_spanish(request: Request, words_request: WordsRequest):
#    return eng_to_spa.translate(words_request.words)

@app.post("/spa_to_eng")
def translate_spanish_to_english(request: Request, words_request: WordsRequest):
    return spa_to_eng.translate(words_request.words)


class ChatRequest(BaseModel):
    recipient: str
    language: str
    message: str

@app.post("/submit_chat")
def submit_chat(request: Request, chat_request: ChatRequest):
    sender = request.session.get("username")
    if sender is None or chat_request.message == None or chat_request.message == "":
        return {"success": False}
    if chat_request.language.lower() != "english":
        translated_message = spa_to_eng.translate(chat_request.message)
    else:
        translated_message = chat_request.message
    with sql_conn.cursor() as cur:
        query = """
            INSERT INTO chats
            (sender, recipient, original_message, translated_message)
            VALUES
            (%s, %s, %s, %s)
        """
        cur.execute(query, (sender, chat_request.recipient, chat_request.message, translated_message))
        sql_conn.commit()
    return {"success": True}

@app.get("/fetch_history")
def fetch_history(request: Request):
    username = request.session.get("username")
    if username is None:
        return {"success": False}
    with sql_conn.cursor() as cur:
        query = """
            SELECT translated_message, original_message, sender
            FROM chats
            WHERE recipient = %s OR sender = %s
            ORDER BY timestamp DESC
            LIMIT 5
        """
        cur.execute(query, (username, username))
        results = cur.fetchall()
        msgs = []
        for msg in results:
            if msg['sender'] == username:
                msgs.append({"message":msg['original_message'], "sender":msg['sender']})
            else:
                msgs.append({"message":msg['translated_message'], "sender":msg['sender']})
    return {"success": True, "history": msgs}

@app.get("/contacts")
def fetch_contacts(request: Request):
    username = request.session.get("username")
    if username is None:
        return {"success": False}
    with sql_conn.cursor() as cur:
        query = """
            SELECT contact_username
            FROM contacts
            WHERE contact_holder = %s
        """
        cur.execute(query, (username))
        results = cur.fetchall()
    return {"success": True, "contacts": [x['contact_username'] for x in results]}