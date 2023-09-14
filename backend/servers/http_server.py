import os, re
from uuid import uuid4
from fastapi import FastAPI, Request, Depends, HTTPException, Response
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from ai_models.translator import Translator
from ai_models.chatbot import Chatbot
from starlette.middleware.sessions import SessionMiddleware
import pymysql

sql_conn = pymysql.connect(
    host=os.environ.get('DB_HOST', '127.0.0.1'),
    user=os.environ.get('DB_USER', 'root'),
    password=os.environ.get("DB_PASSWORD", "yourpassword"),
    database=os.environ.get('DB_NAME', 'translated_chat'),
    cursorclass=pymysql.cursors.DictCursor,
    autocommit=True
)
sql_conn.ping(reconnect=True)

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

translator = Translator()
chatbot = Chatbot()

def sanitize(input_string):
    sanitized_string = re.sub(r'[^a-zA-Z0-9]', '', input_string)
    return sanitized_string

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/login")
def login(login_request:LoginRequest, request: Request):
    print(login_request.username)
    # first fetch the password from db to see if they match
    sql_conn.ping(reconnect=True) # global connection will timeout if nobody has used the app in a while
    with sql_conn.cursor() as cursor:
        cursor.execute('SELECT password, native_language FROM users WHERE username = %s', (sanitize(login_request.username)))
        results = cursor.fetchall()
        assert len(results) == 1
    if results[0]['password'] == login_request.password: # TODO hash passwords
        request.session["username"] = login_request.username
        request.session["native_language"] = results[0]["native_language"]
        return {"success": True}
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

@app.post("/eng_to_spa")
def translate_english_to_spanish(request: Request, words_request: WordsRequest):
    return translator.translate("spa", words_request.words)

@app.post("/spa_to_eng")
def translate_spanish_to_english(request: Request, words_request: WordsRequest):
    return translator.translate("eng", words_request.words)


class ChatRequest(BaseModel):
    recipient: str
    language: str
    message: str

@app.post("/submit_chat")
def submit_chat(request: Request, chat_request: ChatRequest):
    sender = request.session.get("username")
    print("sc", sender, chat_request.language)
    if sender is None or chat_request.message == None or chat_request.message == "":
        return {"success": False}
    if chat_request.language.lower() == "english":
        translated_message = translator.translate("spa", chat_request.message)
    else:
        translated_message = translator.translate("eng", chat_request.message)
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

class AiChatRequest(BaseModel):
    context: str
    message: str

@app.post("/submit_chat_ai")
def submit_chat_ai(request: Request, chat_request: AiChatRequest):
    sender = request.session.get("username")
    print("sc", sender, chat_request.message)
    if sender is None or chat_request.message == None or chat_request.message == "":
        return {"success": False}

    bot_response = chatbot.generate(chat_request.context, chat_request.message)
    messages_parsed = bot_response.split("<|endoftext|>")
    translated_messages = []
    # translate each message
    for message in messages_parsed[:-1]: # ignore last element which will always be empty string
        translated_messages.append(translator.translate("spa", message))
    # put them back into format with <|endoftext|> token
    translated_response = "<|endoftext|>".join(translated_messages) + "<|endoftext|>"
    return {"success": True, "response": bot_response, "translated": translated_response}

@app.get("/fetch_history")
def fetch_history(recipient:str, lang:str, translate:bool, request: Request):
    username = request.session.get("username")
    if username is None or recipient is None or lang is None:
        return {"success": False}
    print(lang, username, recipient, translate)
    with sql_conn.cursor() as cur:
        query = """
            SELECT chats.translated_message, chats.original_message, chats.sender, users.native_language
            FROM chats LEFT JOIN users ON chats.sender=users.username
            WHERE (recipient = %s AND sender = %s) OR (recipient = %s AND sender = %s)
            ORDER BY timestamp DESC
            LIMIT 5
        """
        cur.execute(query, (recipient, username, username, recipient))
        results = cur.fetchall()
        print(results)
        msgs = []
        for msg in results:
            if msg['native_language'] == lang or not translate:
                msgs.append({"message":msg['original_message'], "sender":msg['sender']})
            else:
                msgs.append({"message":msg['translated_message'], "sender":msg['sender']})
        print(msgs)
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