import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link } from 'react-router-dom';
import http from './api/http';
import { connectWS, onTransactionsUpdated, onAlert } from './api/ws';
import Header from './components/Header';
import Footer from './components/Footer';
import TransactionForm from './components/TransactionForm';
import TransactionsTable from './components/TransactionsTable';
import BudgetBar from './components/BudgetBar';
import Charts from './components/Charts';
import LiveFeed from './components/LiveFeed';
import CsvManagement from './components/CsvManagement';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './App.css';
import './pages/AuthPages.css';


const showDesktopNotification = (title, body) => {
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/icon.png' });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, { body, icon: '/icon.png' });
      }
    });
  }
};

function MainDashboard({ isAuthenticated, onAuthenticated }) {
  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState({ amount: 0 });
  const [toast, setToast] = useState(null);
  const [feedItems, setFeedItems] = useState([]);
  const formOpenRef = useRef(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const handleAuthError = useCallback((error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error('인증 실패: 세션 만료. 로그인 페이지로 이동합니다.');
      navigate("/login");
      return true;
    }
    return false;
  }, [navigate]);

  const fetchAllData = useCallback(async () => {
    let allSucceeded = true;

    try {
      const tx = await http.get(`/transactions`).then(r => r.data);
      setTransactions(tx);
    } catch (e) {
      if (handleAuthError(e)) allSucceeded = false;
    }

    try {
      if (allSucceeded) {
        const bg = await http.get(`/budget/current`).then(r => r.data);
        setBudget(bg);
      }
    } catch (e) {
      if (handleAuthError(e)) allSucceeded = false;
    }

    return allSucceeded;
  }, [handleAuthError]);


  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);

    try {
      await http.get('/auth/me');
      onAuthenticated();
    } catch (e) {
      handleAuthError(e);
      setIsLoading(false);
      return;
    }

    const dataLoaded = await fetchAllData();
    if (!dataLoaded) {
    }

    setIsLoading(false);
  }, [onAuthenticated, fetchAllData, handleAuthError]);


  useEffect(() => {
    if (!isAuthenticated) {
      fetchInitialData();
    } else {
      fetchAllData();
      setIsLoading(false);
    }

    connectWS();

    const off1 = onTransactionsUpdated(async (updateMessage) => {
      await fetchAllData();
      if (updateMessage) {
        setFeedItems(prev => [updateMessage, ...prev].slice(0, 10));
      }
    });

    const off2 = onAlert((msg) => {
      setToast(msg);
      setTimeout(() => setToast(null), 4000);
      showDesktopNotification('💰 예산 알림', msg);
    });

    return () => { off1(); off2(); };
  }, [isAuthenticated, fetchInitialData, fetchAllData]);


  const filtered = useMemo(() => {
    if (!search.trim()) return transactions;
    return transactions.filter(t =>
      (t.memo && t.memo.includes(search)) ||
      (t.category && t.category.includes(search))
    );
  }, [transactions, search]);

  const balance = useMemo(
    () => transactions.reduce((acc, t) => acc + (t.type === 'INCOME' ? t.amount : -t.amount), 0),
    [transactions]
  );

  const recentItems = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (let i = transactions.length - 1; i >= 0 && list.length < 5; i--) {
      const desc = transactions[i].description || transactions[i].memo || transactions[i].category || '';
      if (!desc) continue;
      if (!seen.has(desc)) {
        seen.add(desc);
        list.push(desc);
      }
    }
    return list;
  }, [transactions]);

  if (isLoading && !isAuthenticated) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', color: '#BDBDBD' }}>
        <p>데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <>
      <p className="dashboard-balance">
        현재 잔액:{" "}
        <b className={balance >= 0 ? "balance-positive" : "balance-negative"}>
          {balance.toLocaleString()} 원
        </b>
      </p>

      <div className="top-grid">
        <BudgetBar budget={budget} transactions={transactions} onUpdated={fetchAllData} />
      </div>

      <section className="form-section">
        <TransactionForm
          ref={formOpenRef}
          onSaved={fetchAllData}
          recentItems={recentItems}
        />
        <div style={{ marginTop: 12 }}>
        </div>

        <CsvManagement
          transactions={transactions}
          onImportComplete={fetchAllData}
          setToast={setToast}
        />
      </section>

      <section className="transactions-section">
        <h2>거래 내역</h2>
        <input
          type="text"
          placeholder="검색 (메모, 카테고리 등)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: 6, marginBottom: 8, width: '50%' }}
        />
        <TransactionsTable items={filtered} onChanged={fetchAllData} />
      </section>

      <div className="bottom-grid">
        <section className="charts-section">
          <h2>데이터 분석</h2>
          <Charts items={transactions} />
        </section>

        <section className="feed-section">
          <LiveFeed items={feedItems} />
        </section>
      </div>

      {toast && (
        <div role="alert" className="toast">
          {toast}
        </div>
      )}
    </>
  );
}


function AppWrapper() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const handleLoginSuccess = (isAuth) => {
    setIsAuthenticated(isAuth);
    if (isAuth) {
      navigate("/");
    }
  };

  const handleLogout = async () => {
    try {
      await http.post('/auth/logout');
    } catch (e) {
      console.error('로그아웃 요청 실패:', e);
    }

    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <div className="app-container">
      <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />

      <div className="content-wrap" style={{ minHeight: '100vh', padding: '100px 24px 70px' }}>
        <Routes>
          <Route
            path="/"
            element={
              <MainDashboard
                isAuthenticated={isAuthenticated}
                onAuthenticated={() => setIsAuthenticated(true)}
              />
            }
          />
          <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}