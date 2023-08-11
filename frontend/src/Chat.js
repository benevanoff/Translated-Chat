import React, { useState, useRef, useEffect} from 'react';
import { useNavigate, useParams} from 'react-router-dom';

function Chat(props) {
    const [inputValue, setInputValue] = useState('');

    const inputRef = useRef(null);
    const languageRef = useRef(null);
    const refreshHistoryRef = useRef(0);
    const [messagesState, setMessages] = useState([]);

    const navigate = useNavigate();

    const {recipient} = useParams();

    async function fetchUser() {
      try {
        const response = await fetch('http://127.0.0.1:8000/user_info', {
          method: 'GET',
          credentials: 'include'
        });
        const jsonData = await response.json();
        if (jsonData.success !== true)
          navigate("/login");
        console.log(jsonData);
        languageRef.current = jsonData.language;
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const handleInputChange = async (e) => {
        setInputValue(e.target.value);
    };

    if (languageRef.current === null)
      fetchUser();

    const translate = async (e) => {
      e.preventDefault();
      console.log(inputValue);
      let url = "http://127.0.0.1:8000/submit_chat";
      let payload = {"recipient": recipient, "language": languageRef.current, "message": inputValue};
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

    useEffect( () => {
      // TODO: replace polling with websockets
      const fetch_history = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/fetch_history', {
          method: 'GET',
          credentials: 'include'
        });
        const jsonData = await response.json();
        console.log(jsonData.history);
        setMessages(jsonData.history);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      };
      fetch_history();
      let interval = setInterval(fetch_history, 5000);
      return () => clearInterval(interval);
    }, []);

    const render_chat_text = () => {
      return messagesState.map((msg, index) => (
        <div key={index} className="word-bubble">
            <p>{msg}</p>
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
        <button onClick={translate}>Send</button>
      </center>
    </div>
    );
}

export default Chat