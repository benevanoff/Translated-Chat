import pytest
import sys
from ai_models.chatbot import Chatbot

def test_chatbot_generate_history():
    # ensure that the user input is included in the bot's history
    ben_bot = Chatbot()
    
    history1 = ben_bot.generate("", "Hello!")
    assert "Hello!" in history1
    
    history2 = ben_bot.generate(history1, "How are you?")
    assert "How are you?" in history2
    del ben_bot # this takes a lot of memory so be sure to free

def test_chatbot_generate_response():
    # since DialoGPT uses deterministic max sampling in generation
    # we can ensure that we get the same outputs for the same inputs each time
    ben_bot = Chatbot()
    
    chat1 = ben_bot.generate("", "Hello!")
    assert chat1 == "Hello!<|endoftext|>Hello! :D<|endoftext|>"
    chat1 = ben_bot.generate(chat1, "How are you?")
    assert chat1 == "Hello!<|endoftext|>Hello! :D<|endoftext|>How are you?<|endoftext|>I'm good! How are you?<|endoftext|>"
    del ben_bot

def test_chatbot_foreign_input():
    # just to see what it does, maybe we will handle this better later
    # currently it responds with little quips about not understanding
    ben_bot = Chatbot()

    chat1 = ben_bot.generate("", "¡Hola!")
    assert chat1 == "¡Hola!<|endoftext|>I'm not sure if you're serious, but that's a Spanish word.<|endoftext|>"

    chat2 = ben_bot.generate("Hello!<|endoftext|>Hello! :D<|endoftext|>", "¿Cómo estás?")
    assert chat2 == "Hello!<|endoftext|>Hello! :D<|endoftext|>¿Cómo estás?<|endoftext|>I'm not sure what you're trying to say, but I'm not sure what you're trying to say either.<|endoftext|>"