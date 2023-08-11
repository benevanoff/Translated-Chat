import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Chat from './Chat.js'
import Login from './Login.js';
import Navbar from './Navbar';

const App = () => {
  return (
    <Router>
        <Routes>
          <Route path="/chat/:recipient" element={<Chat/>} />
          <Route path="/login" element={<Login/>} />
        </Routes>
    </Router>
  );
};

export default App;