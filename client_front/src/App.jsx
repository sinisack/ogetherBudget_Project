import { useEffect, useMemo, useState } from 'react'
import http from './api/http'
import { connectWS, onTransactionsUpdated, onAlert } from './api/ws'
import TransactionForm from './components/TransactionForm'
import TransactionsTable from './components/TransactionsTable'
import BudgetBar from './components/BudgetBar'
import Charts from './components/Charts'
import LiveFeed from './components/LiveFeed'
import './App.css'

const showDesktopNotification = (title, body) => {
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/icon.png' })
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, { body, icon: '/icon.png' })
      }
    })
  }
}

export default function App() {
  const [transactions, setTransactions] = useState([])
  const [budget, setBudget] = useState({ amount: 0 })
  const [toast, setToast] = useState(null)
  const [feedItems, setFeedItems] = useState([])

  const fetchAll = async () => {
    try {
      const tx = await http.get(`/transactions`).then(r => r.data)
      setTransactions(tx)
    } catch (e) {
      console.error('GET /transactions 실패', e)
      alert('거래 조회 실패 (/transactions)')
    }
    try {
      const bg = await http.get(`/budget/current`).then(r => r.data)
      setBudget(bg)
    } catch (e) {
      console.error('GET /budget/current 실패', e)
      alert('예산 조회 실패 (/budget/current)')
    }
  }

  useEffect(() => {
    connectWS()
    fetchAll()

    const off1 = onTransactionsUpdated((updateMessage) => {
      fetchAll()
      if (updateMessage) {
        setFeedItems(prev => [updateMessage, ...prev].slice(0, 10))
      }
    })

    const off2 = onAlert((msg) => {
      setToast(msg)
      setTimeout(() => setToast(null), 4000)
      showDesktopNotification('💰 예산 알림', msg)
    })
    return () => { off1(); off2() }
  }, [])

  const balance = useMemo(
    () => transactions.reduce((acc, t) => acc + (t.type === 'INCOME' ? t.amount : -t.amount), 0),
    [transactions]
  )

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">실시간 가계부</h1>
        <p className="dashboard-balance">
          현재 잔액:{" "}
          <b className={balance >= 0 ? "balance-positive" : "balance-negative"}>
            {balance.toLocaleString()} 원
          </b>
        </p>
      </header>

      <div className="top-grid">
        <BudgetBar budget={budget} transactions={transactions} onUpdated={fetchAll} />
      </div>

      <section className="form-section">
        <TransactionForm onSaved={fetchAll} />
      </section>

      <section className="transactions-section">
        <h2>거래 내역</h2>
        <TransactionsTable items={transactions} onChanged={fetchAll} />
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
    </div>
  )
}