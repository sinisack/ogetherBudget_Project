import { Link, useNavigate } from 'react-router-dom';
import http from '../api/http';
import './HeaderFooter.css';

function Header({ isAuthenticated, onLogout }) {
  const navigate = useNavigate();
  const username = "사용자";

  const handleLogout = async () => {
    onLogout();
  };

  return (
    <header className="header-container">
      <div className="logo-section">
        <Link to="/" className="logo-link">WIZLET</Link>
      </div>

      <nav className="nav-menu">
        <ul className="nav-list">
          <li><Link to="/list" className="nav-link">list</Link></li>
          <li><Link to="/users" className="nav-link">users</Link></li>
          <li><Link to="/settings" className="nav-link">settings</Link></li>
        </ul>
        
        {isAuthenticated ? (
          <button className="logout-btn" onClick={handleLogout}>
            로그아웃
          </button>
        ) : (
          <Link to="/login" className="login-button">login</Link>
        )}
      </nav>
    </header>
  );
}

export default Header;