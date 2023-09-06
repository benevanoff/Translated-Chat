import React, { useState, useRef, useEffect} from 'react';
import { useNavigate, useParams} from 'react-router-dom';

import './Chat.css'

function Chat(props) {
    const [inputValue, setInputValue] = useState('');

    const [languageState, setLanguage] = useState(null);
    const [senderState, setSender] = useState(null); // this shouldnt change after first load but use state to force re-render
    const [messagesState, setMessages] = useState([]);
    const originalMessages = useRef([]);
    const translatedMessages = useRef([]);

    const navigate = useNavigate();

    const [doTranslation, setTranslationSetting] = useState(true);

    const handleTranslateChange = () => {
      setTranslationSetting(!doTranslation);
    };

    const {recipient} = useParams();

    const http_host = process.env.REACT_APP_BACKEND_HOST;
    const websocket_host = process.env.REACT_APP_WEBSOCKET_HOST;

    const handleInputChange = async (e) => {
        setInputValue(e.target.value);
    };

    const submitChat = async (e) => {
      e.preventDefault();
      console.log(inputValue);
      // adjust messages on screen
      let tmp = messagesState;
      tmp.shift();
      tmp.push({message: inputValue, sender: senderState});
      console.log(tmp);
      setMessages(tmp);
      // now POST new message to backend
      let url = "http://"+http_host+"/submit_chat";
      let payload = {"recipient": recipient, "language": languageState, "message": inputValue};
      console.log(payload);
      try {
        const response = await fetch(url, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        const responseData = await response.json();
        console.log('Response:', responseData);
        console.log(responseData);
      } catch (error) {
        console.error('Error:', error);
      }
      setInputValue('');
    };

    const submitChatAi = async (e) => {
      e.preventDefault();
      console.log(inputValue);
      console.log('messages state');
      console.log(messagesState);
      // first convert the message history to tokenized string
      let context = "";
      console.log("messagesState.length", messagesState.length);
      for (let i = 0; i < messagesState.length; i++) {
        context += (messagesState[i].message + "<|endoftext|>");
      }
      // adjust messages on screen
      let tmp = messagesState;
      tmp.shift();
      tmp.push({message: inputValue, sender: senderState});
      console.log(tmp);
      setMessages(tmp);
      // now POST new message to backend
      let url = "http://"+http_host+"/submit_chat_ai";
      let payload = {"context": context, "message": inputValue, "translate": doTranslation};
      console.log(payload);
      try {
        const response = await fetch(url, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        const responseData = await response.json();
        console.log('Response:', responseData);
        // post process response, which includes the whole history in the format message1<|endoftext|>message2<|endoftext|>
        let original_texts = responseData.response.split("<|endoftext|>").slice(0,-1);
        let translated_texts = responseData.translated.split("<|endoftext|>").slice(0,-1);
        tmp = [];
        let tmp_translated = [];
        for (let i = 0; i < original_texts.length; i++) {
          if (i % 2 == 0) { // sender and reciever switch each turn, starting with user
            tmp.push({message: original_texts[i], sender: senderState});
            tmp_translated.push({message: translated_texts[i], sender: senderState});
          }
          else { 
            tmp.push({message: original_texts[i], sender: "Ai"});
            tmp_translated.push({message: translated_texts[i], sender: "Ai"});
          }
        }
        // then update message state
        if (!doTranslation) {
          setMessages(tmp);
        } else {
          setMessages(tmp_translated);
        }
        originalMessages.current = tmp;
        translatedMessages.current = tmp_translated;
      } catch (error) {
        console.error('Error:', error);
      }
      setInputValue('');
    };

    useEffect(() => {
      const fetchUser = async () => {
        try {
          const response = await fetch('http://' + http_host + '/user_info', {
            method: 'GET',
            credentials: 'include',
          });
          const jsonData = await response.json();
          if (jsonData.success !== true) navigate('/login');
          console.log(jsonData);
          setLanguage(jsonData.language);
          setSender(jsonData.username);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      fetchUser();
    }, [http_host]);
    
    useEffect(() => {
      const fetch_history = async () => {
        try {
          const response = await fetch('http://'+http_host+'/fetch_history?lang='+languageState+'&recipient='+recipient+'&translate='+doTranslation, {
            method: 'GET',
            credentials: 'include',
          });
          const jsonData = await response.json();
          console.log(jsonData.history);
          setMessages(jsonData.history.reverse());
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      if (recipient != "Ai") {
        if (languageState !== null) {
          fetch_history();
        }
  
        const ws = new WebSocket(websocket_host);
        ws.onopen = () => {
          console.log('Connected to WebSocket');
        };
        ws.onmessage = (event) => {
          if (languageState !== null)
            fetch_history();
        };
      }
    }, [doTranslation, languageState, http_host]);

    useEffect(() => {
      if (doTranslation)
        setMessages(translatedMessages.current);
      else
        setMessages(originalMessages.current);
    }, [doTranslation]);

    const render_chat_text = () => {
      return messagesState.map((msg, index) => (
        <div key={index}>
            <span className={msg.sender === senderState ? "chat-bubble-sender": "chat-bubble-recv"}>{msg.message}</span>
        </div>
      ));
    };

    let submitChatFunc = recipient != "Ai" ? submitChat : submitChatAi;
    return (
    <div style={{margin: 10}}>
      <center>
        <h2>{recipient}</h2>
        <label>{doTranslation ? 'Translation: On ' : 'Translation: Off '}</label>
        <input
          type="checkbox"
          checked={doTranslation}
          onChange={handleTranslateChange}
        />
      </center>
      <div id="history">
      <center>{render_chat_text()}</center>
      </div>
      <center>
        <textarea
            type="text"
            id="inputField"
            value={inputValue}
            style={{ textAlign: 'center' }}
            onChange={handleInputChange} 
        />
      </center>
      <center>
        <button onClick={submitChatFunc}>Send</button>
      </center>
    </div>
    );
}

export default Chat