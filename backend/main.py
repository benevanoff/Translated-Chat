import os
from fastapi import FastAPI, Request
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from translator import Translator

app = FastAPI()

# CORS configuration
origins = [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    f'http://{os.environ.get("HOST_IP", "127.0.0.1")}:3000'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

eng_to_spa = Translator("eng")
spa_to_eng = Translator("spa")

class WordsRequest(BaseModel):
    words: str

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.post("/eng_to_spa")
def translate_english_to_spanish(request: Request, words_request: WordsRequest):
    return eng_to_spa.translate(words_request.words)

@app.post("/spa_to_eng")
def translate_spanish_to_english(request: Request, words_request: WordsRequest):
    return spa_to_eng.translate(words_request.words)