import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import TransactionsPage from './pages/TransactionsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { isLoggedIn } from './api/auth';
import './App.css';

export default function App() {
  const [authenticated, setAuthenticated] = useState(isLoggedIn());

  useEffect(() => {
    const handleStorageChange = () => setAuthenticated(isLoggedIn());
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Header authenticated={authenticated} onLogout={() => setAuthenticated(false)} />

        <main className="content-wrap">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/list" element={<TransactionsPage />} />
            <Route path="/login" element={<LoginPage onLoginSuccess={() => setAuthenticated(true)} />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}