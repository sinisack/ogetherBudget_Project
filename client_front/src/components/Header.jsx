import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import http from '../api/http';
// 별도의 CSS 파일 (예: Header.css)에 스타일을 정의해야 합니다.

function Header({ isAuthenticated, onLogout }) {
  const navigate = useNavigate();

  const username = "사용자"; 

  const handleLogout = async () => {
    onLogout();
  };

  return (
    <header className="header-container" style={{
      backgroundColor: '#1E1E1E',
      color: '#BDBDBD',
      padding: '10px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <div className="logo-section" style={{ color: '#5DADE2', fontWeight: 'bold', fontSize: '24px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>WIZLET</Link>
      </div>

      <nav className="nav-menu" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <ul className="nav-list" style={{ display: 'flex', listStyle: 'none', gap: '20px', padding: 0, margin: 0 }}>
          <li><Link to="/list" style={{ textDecoration: 'none', color: '#BDBDBD' }}>list</Link></li>
          <li><Link to="/users" style={{ textDecoration: 'none', color: '#BDBDBD' }}>users</Link></li>
          <li><Link to="/settings" style={{ textDecoration: 'none', color: '#BDBDBD' }}>settings</Link></li>
        </ul>
        
        {isAuthenticated ? (
          <button 
            className="logout-btn" 
            onClick={handleLogout}
            style={{ 
              backgroundColor: '#1E1E1E', 
              color: '#5DADE2', 
              border: '1px solid #5DADE2', 
              padding: '8px 15px', 
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            로그아웃
          </button>
        ) : (
          <Link 
            to="/login" 
            className="login-button"
            style={{ 
              backgroundColor: '#5DADE2', 
              color: '#1E1E1E', 
              border: 'none', 
              padding: '8px 15px', 
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: 'bold'
            }}
          >
            login
          </Link>
        )}
      </nav>
    </header>
  );
}

export default Header;