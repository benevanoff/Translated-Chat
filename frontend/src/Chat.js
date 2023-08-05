import React, { useState, useRef} from 'react';

function Chat(props) {
    const [inputValue, setInputValue] = useState('');

    const inputRef = useRef(null);
    const [messagesState, setMessages] = useState([]);

    const handleInputChange = async (e) => {
        setInputValue(e.target.value);
      };

    const translate = async (e) => {
      if (props.translate === "false") {
        console.log(inputValue);
        setMessages(messagesState.concat(inputValue));
        return;
      }
        e.preventDefault();
        console.log(inputValue);
        let url = props.lang === "English" ? "http://127.0.0.1:8000/eng_to_spa" : "http://127.0.0.1:8000/spa_to_eng"
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({"words": inputValue}),
          });
          const responseData = await response.json();
          console.log('Response:', responseData);
          console.log(responseData);
          setMessages(messagesState.concat(responseData));
        } catch (error) {
          console.error('Error:', error);
        }
      };

    const render_chat_text = () => {
      return messagesState.map((word, index) => (
        <div key={index} className="word-bubble">
            <p>{word}</p>
        </div>
      ));
    };
    return (
    <div style={{margin: 10}}>
      <center><h2>Chat in {props.lang}</h2></center>
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