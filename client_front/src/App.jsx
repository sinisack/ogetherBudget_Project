import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import TransactionsPage from './pages/TransactionsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Settings from './pages/Settings';   // ⭐ 추가
import { isLoggedIn } from './api/auth';
import http from './api/http';
import './App.css';

export default function App() {
  const [authenticated, setAuthenticated] = useState(isLoggedIn());
  const [transactions, setTransactions] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handleStorageChange = () => setAuthenticated(isLoggedIn());
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await http.get('/transactions');
      setTransactions(res.data);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    }
  };

  useEffect(() => {
    if (authenticated) fetchTransactions();
  }, [authenticated]);

  const addTransaction = (t) => {
    setTransactions(prev => [...prev, t]);
  };

  const updateTransactions = () => fetchTransactions();

  return (
    <Router>
      <div className="app-container">
        <Header authenticated={authenticated} onLogout={() => setAuthenticated(false)} />

        {toast && <div style={{ margin: '8px 0', color: 'green' }}>{toast}</div>}

        <main className="content-wrap">
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  transactions={transactions}
                  onAddTransaction={addTransaction}
                  onTransactionsChange={updateTransactions}
                  setToast={setToast}
                />
              }
            />
            <Route
              path="/list"
              element={
                <TransactionsPage
                  transactions={transactions}
                  onTransactionsChange={updateTransactions}
                  setToast={setToast}
                />
              }
            />
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<LoginPage onLoginSuccess={() => setAuthenticated(true)} />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}