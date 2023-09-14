from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

class Translator:

    def __init__(self):
        self.en_es_tokenizer = AutoTokenizer.from_pretrained("Helsinki-NLP/opus-mt-en-es")
        self.en_es_language_model = AutoModelForSeq2SeqLM.from_pretrained("Helsinki-NLP/opus-mt-en-es")
        self.es_en_tokenizer = AutoTokenizer.from_pretrained("Helsinki-NLP/opus-mt-es-en")
        self.es_en_language_model = AutoModelForSeq2SeqLM.from_pretrained("Helsinki-NLP/opus-mt-es-en")

    def translate(self, target_language:str, message:str):
        if target_language == "eng":
            tokenizer = self.es_en_tokenizer
            language_model = self.es_en_language_model
        else:
            tokenizer = self.en_es_tokenizer
            language_model = self.en_es_language_model
        
        inputs = tokenizer(message, return_tensors="pt", padding=True)
        output_sequences = language_model.generate(
            input_ids=inputs["input_ids"],
            max_new_tokens=200
        )
        return (tokenizer.decode(output_sequences[0], skip_special_tokens=True))