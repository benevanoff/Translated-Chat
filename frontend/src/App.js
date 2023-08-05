import logo from './logo.svg';
import './App.css';
import Chat from './Chat.js'

function App() {
  return (
    <div className="chats-container">
      <Chat lang="English" translate="false" />
      <Chat lang="Spanish" translate="true"/>
    </div>  
  );
}

export default App;
