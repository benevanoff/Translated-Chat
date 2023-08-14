import React, { useState, useRef, useEffect} from 'react';
import { useNavigate, useParams} from 'react-router-dom';

import './Chat.css'

function Chat(props) {
    const [inputValue, setInputValue] = useState('');

    const inputRef = useRef(null);
    const [languageState, setLanguage] = useState(null);
    const [senderState, setSender] = useState(null); // this shouldnt change after first load but use state to force re-render
    const [messagesState, setMessages] = useState([]);

    const navigate = useNavigate();

    const {recipient} = useParams();

    const http_host = process.env.REACT_APP_BACKEND_HOST;

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
          const response = await fetch('http://'+http_host+'/fetch_history?lang=' + languageState, {
            method: 'GET',
            credentials: 'include',
          });
          const jsonData = await response.json();
          console.log(jsonData.history);
          setMessages(jsonData.history);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
    
      if (languageState !== null) {
        fetch_history();
      }

      const ws = new WebSocket('ws://127.0.0.1:8080');
      ws.onopen = () => {
        console.log('Connected to WebSocket');
      };
      ws.onmessage = (event) => {
        if (languageState !== null)
          fetch_history();
      };
    }, [languageState, http_host]);

    const render_chat_text = () => {
      return messagesState.map((msg, index) => (
        <div key={index}>
            <span className={msg.sender === senderState ? "chat-bubble-sender": "chat-bubble-recv"}>{msg.message}</span>
        </div>
      ));
    };

    return (
    <div style={{margin: 10}}>
      <center><h2>{recipient}</h2></center>
      <div id="history">
      <center>{render_chat_text()}</center>
      </div>
      <center>
        <textarea
            ref={inputRef}
            type="text"
            id="inputField"
            value={inputValue}
            style={{ textAlign: 'center' }}
            onChange={handleInputChange} 
        />
      </center>
      <center>
        <button onClick={submitChat}>Send</button>
      </center>
    </div>
    );
}

export default Chat