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
          <li><button className="nav-link" onClick={() => handleProtectedNav("/summary")}>요약</button></li>
          <li><button className="nav-link" onClick={() => handleProtectedNav("/settings")}>설정</button></li>
        </ul>

        {authenticated ? (
          <button className="auth-btn" onClick={handleLogout}>로그아웃</button>
        ) : (
          <button className="auth-btn" onClick={() => navigate('/login')}>로그인</button>
        )}
      </nav>
    </header>
  );
}

export default Header;