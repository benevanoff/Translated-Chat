import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'
import flag_globe_en_es from './flag_globe_en_es.png';

const Login = () => {
    const navigate = useNavigate();

    const http_host = process.env.REACT_APP_BACKEND_HOST;

    const requestLogin = async (username, password) => {
        try {
        const response = await fetch("http://"+http_host+"/login", {
            method: 'POST',
            credentials: 'include',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({"username": username, "password": password}),
        });
        const responseData = await response.json();
        if (responseData.success) {
            navigate('/contacts');
        }
        console.log('Response:', responseData);
        } catch (error) {
        console.error('Error:', error);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        console.log(e.target.username.value);
        requestLogin(e.target.username.value, e.target.password.value);
    };
    return (
        <form onSubmit={handleLogin} className="login-container">
            <div>
                <h1>Translated Chat</h1>
                <img src={flag_globe_en_es} alt="app logo" />
            </div>
            <label className="input-container">username <input type="text" name='username'/></label>
            <label className="input-container">password <input type="password" name="password"/></label>
            <button className="submit-button">Login</button>
        </form>
    );
};

export default Login;