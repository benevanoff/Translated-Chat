import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';

import './Contacts.css' 

const Contacts = () => {
    const [contacts, setContacts] = useState([]);
    const navigate = useNavigate();

    const handleContactClick = (e) => {
        navigate('/chat/' + e.target.innerText);
    };

    const renderContacts = () => {
      return contacts.map((name, index) => (
        <span className='chat-bubble' name='idk' onClick={handleContactClick}>{name}</span>
      ));
    };

    useEffect(() => {
      const fetchContacts = async () =>  {
        const http_host = process.env.REACT_APP_BACKEND_HOST;
        try {
          const response = await fetch('http://'+http_host+'/contacts', {
            method: 'GET',
            credentials: 'include'
          });
          const jsonData = await response.json();
          //if (jsonData.success !== true)
            //navigate("/login");
          console.log(jsonData);
          setContacts(jsonData.contacts);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      fetchContacts();
    }, []);

    return (
        <center>
            <h2>Contacts</h2>
            {renderContacts()}
        </center>
    );
};

export default Contacts;