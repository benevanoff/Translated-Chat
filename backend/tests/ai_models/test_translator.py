import pytest
from ai_models.translator import Translator 

def test_english_to_spanish():
    translator = Translator()
    # first a basic test
    translation = translator.translate("spa", "Hello")
    assert translation == "Hola."

def test_spanish_to_english():
    translator = Translator()
    # first a basic test
    translation = translator.translate("eng", "Hola")
    assert translation == "Hello."