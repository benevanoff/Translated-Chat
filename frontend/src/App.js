import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Chat from './Chat.js'
import Login from './Login.js';
import Contacts from './Contacts';

const App = () => {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<Login/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/contacts" element={<Contacts/>} />
          <Route path="/chat/:recipient" element={<Chat/>} />
        </Routes>
    </Router>
  );
};

export default App;