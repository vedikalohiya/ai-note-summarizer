import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css"; // Make sure you have this CSS file for styling

const Navbar = () => {
  // useLocation is a hook that returns the location object from the current URL
  const location = useLocation();

  return (
    <nav className="navbar">
      <h1 className="logo">🧠 AI Note Summarizer</h1>
      <ul className="nav-links">
        {/* Check if the current path is '/', if so, apply the 'active' class */}
        <li className={location.pathname === "/" ? "active" : ""}>
          <Link to="/">Summarizer</Link>
        </li>
        {/* Check if the current path is '/history', if so, apply the 'active' class */}
        <li className={location.pathname === "/history" ? "active" : ""}>
          <Link to="/history">History</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;