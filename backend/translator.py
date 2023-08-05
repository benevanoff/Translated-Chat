from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

class Translator:

    def __init__(self, target_language:str):
        if target_language == "eng":
            self.tokenizer = AutoTokenizer.from_pretrained("Helsinki-NLP/opus-mt-en-es")
            self.language_model = AutoModelForSeq2SeqLM.from_pretrained("Helsinki-NLP/opus-mt-en-es")
        elif target_language == "spa":
            self.tokenizer = AutoTokenizer.from_pretrained("Helsinki-NLP/opus-mt-es-en")
            self.language_model = AutoModelForSeq2SeqLM.from_pretrained("Helsinki-NLP/opus-mt-es-en")

    def translate(self, message:str):
        inputs = self.tokenizer(message, return_tensors="pt", padding=True)
        output_sequences = self.language_model.generate(
            input_ids=inputs["input_ids"],
            max_new_tokens=200
        )
        return (self.tokenizer.decode(output_sequences[0], skip_special_tokens=True))

if __name__ == '__main__':
    translator = Translator("spa")
    translator.translate("no estoy seguro de que debo decir")