import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../api/auth';
import './HeaderFooter.css';

function Header({ authenticated, onLogout }) {
  const navigate = useNavigate();

  const handleProtectedNav = (path) => {
    if (!authenticated) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    onLogout?.();
    navigate('/login');
  };

  return (
    <header className="header-container">
      <div className="logo-section">
        <Link to="/" className="logo-link">WIZLET</Link>
      </div>

      <nav className="nav-menu">
        <ul className="nav-list">
          <li><button className="nav-link" onClick={() => handleProtectedNav("/list")}>list</button></li>
          <li><button className="nav-link" onClick={() => handleProtectedNav("/users")}>users</button></li>
          <li><button className="nav-link" onClick={() => handleProtectedNav("/settings")}>settings</button></li>
        </ul>

        {authenticated ? (
          <button className="auth-btn" onClick={handleLogout}>logout</button>
        ) : (
          <button className="auth-btn" onClick={() => navigate('/login')}>login</button>
        )}
      </nav>
    </header>
  );
}

export default Header;