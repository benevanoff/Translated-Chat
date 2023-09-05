import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

class Chatbot:

    def __init__(self):
        self.tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-medium")
        self.model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-medium") # ~300M param version of GPT fine tuned on reddit conversations... requires ~900MB storage

    def generate(self, context:str, message:str):
        input_ids = self.tokenizer.encode(context + message + self.tokenizer.eos_token, return_tensors='pt')
        output_ids = self.model.generate(input_ids, max_length=10000, pad_token_id=self.tokenizer.eos_token_id)
        return self.tokenizer.decode(output_ids.squeeze(dim=0)) # squeeze out batch dimension and then decode token indices to words

if __name__ == "__main__":
    # very basic test
    ben_bot = Chatbot()
    history1 = ben_bot.generate("", "Hello!")
    history2 = ben_bot.generate(history1, "How are you?")
    print(history2)
    assert history2 == "Hello!<|endoftext|>Hello! :D<|endoftext|>How are you?<|endoftext|>I'm good! How are you?<|endoftext|>"