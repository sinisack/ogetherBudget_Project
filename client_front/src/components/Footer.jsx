import React from 'react';
import { Link } from 'react-router-dom';
import './HeaderFooter.css';
import fbIcon from '../assets/facebook.png';
import xIcon from '../assets/x.png';
import instaIcon from '../assets/instagram.png';

export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-links">
        <Link to="/policy" className="footer-link">Privacy Policy</Link>
        <span className="footer-separator">|</span>
        <Link to="/terms" className="footer-link">Terms and Conditions</Link>
        <span className="footer-separator">|</span>
        <Link to="/cookies" className="footer-link">Cookie Settings</Link>
      </div>

      <div className="footer-right">
        <span>© 2025 WIZLET All rights reserved.</span>
        <img src={fbIcon} alt="Facebook" className="footer-icon" />
        <img src={xIcon} alt="X (Twitter)" className="footer-icon" />
        <img src={instaIcon} alt="Instagram" className="footer-icon" />
      </div>
    </footer>
  );
}