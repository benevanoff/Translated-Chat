import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <li className="navbar-item">
          <Link to="/">Home</Link>
        </li>
        <li className="navbar-item">
          <Link to="/chat">About</Link>
        </li>
        <li className="navbar-item dropdown">
          <span className="dropdown-toggle" onClick={toggleDropdown}>
            Dropdown
          </span>
          {showDropdown && (
            <ul className="dropdown-menu">
              <li>
                <Link to="/dropdown/item1">Item 1</Link>
              </li>
              <li>
                <Link to="/dropdown/item2">Item 2</Link>
              </li>
            </ul>
          )}
        </li>
        <li className="navbar-item">
          <Link to="/contact">Contact</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;