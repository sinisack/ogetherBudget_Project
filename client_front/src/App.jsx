import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link } from 'react-router-dom';
import http from './api/http';
import { connectWS, onTransactionsUpdated, onAlert } from './api/ws';
import Header from './components/Header';
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


function MainDashboard({ isAuthenticated, onAuthenticated }) { // ⭐️ isAuthenticated prop 추가 ⭐️
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

    // 1. GET /api/auth/me 를 호출하여 쿠키 유효성을 확인
    try {
      await http.get('/auth/me');
      onAuthenticated(); // 쿠키 유효성 확인 성공 시, AppWrapper 상태 업데이트
    } catch (e) {
      // /auth/me 호출이 401/403일 경우
      handleAuthError(e);
      setIsLoading(false);
      return; // 인증 실패 시 데이터 로드 중단
    }

    // 2. 인증 확인 후 데이터 로드
    const dataLoaded = await fetchAllData();
    if (!dataLoaded) {
      // fetchAllData 내부에서 리다이렉트 했으므로 추가 작업 불필요
    }

    setIsLoading(false);
  }, [onAuthenticated, fetchAllData, handleAuthError]);


  useEffect(() => {
    // ⭐️ 핵심 수정: isAuthenticated 상태 기반으로 데이터 로딩 시점 조정 ⭐️
    if (!isAuthenticated) {
      // AppWrapper가 처음 렌더링될 때만 실행. 쿠키가 유효한지 확인.
      fetchInitialData();
    } else {
      // 로그인 성공 후 AppWrapper에서 isAuthenticated=true로 바뀐 후 실행.
      // 이 때 쿠키는 최신 토큰을 반영했을 것이므로, 데이터 로드를 시작
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
  }, [isAuthenticated, fetchInitialData, fetchAllData]); // ⭐️ 의존성 배열에 isAuthenticated 추가 ⭐️


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

  if (isLoading && !isAuthenticated) { // ⭐️ 로딩 조건 수정 ⭐️
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

  // ⭐️ 수정: onLoginSuccess가 인자를 받아 상태를 업데이트하고 리디렉션함 ⭐️
  const handleLoginSuccess = (isAuth) => {
    setIsAuthenticated(isAuth);
    if (isAuth) {
      navigate("/"); // 로그인 성공 시 메인으로 바로 이동
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

      <div className="content-wrap" style={{ minHeight: '100vh', paddingBottom: '70px' }}>
        <Routes>
          <Route
            path="/"
            element={
              <MainDashboard
                isAuthenticated={isAuthenticated} // ⭐️ prop 추가 ⭐️
                onAuthenticated={() => setIsAuthenticated(true)}
              />
            }
          />

          <Route
            path="/login"
            element={
              <LoginPage
                onLoginSuccess={handleLoginSuccess} // ⭐️ 함수 전달 ⭐️
              />
            }
          />

          <Route path="/register" element={<RegisterPage />} />

        </Routes>
      </div>

      <footer style={{
        backgroundColor: '#1A1A1A',
        color: '#BDBDBD',
        fontSize: '12px',
        position: 'fixed',
        bottom: 0,
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 30px',
        boxSizing: 'border-box',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', gap: '15px' }}>
          <Link to="/policy" style={{ color: '#BDBDBD', textDecoration: 'none' }}>Privacy Policy</Link>
          <span style={{ color: '#666' }}>|</span>
          <Link to="/terms" style={{ color: '#BDBDBD', textDecoration: 'none' }}>Terms and Conditions</Link>
          <span style={{ color: '#666' }}>|</span>
          <Link to="/cookies" style={{ color: '#BDBDBD', textDecoration: 'none' }}>Cookie Settings</Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span>© 2025 WIZLET All rights reserved.</span>
        </div>
      </footer>
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