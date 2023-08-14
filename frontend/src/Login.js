import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

    const http_host = process.env.REACT_APP_BACKEND_HOST;

    const requestLogin = async (username) => {
        try {
        const response = await fetch("http://"+http_host+"/login", {
            method: 'POST',
            credentials: 'include',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({"username": username, "password": "secret"}),
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
        requestLogin(e.target.username.value);
    };
    return (
        <form onSubmit={handleLogin}>
            <label>username <input type="text" name='username'/></label>
            <label>password <input type="password" /></label>
            <button type="submit">Submit</button>
        </form>
    );
};

export default Login;