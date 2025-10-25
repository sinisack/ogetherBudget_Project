import React, { useEffect, useMemo, useState } from 'react'
import http from './api/http'
import { connectWS, onTransactionsUpdated, onAlert } from './api/ws'
import TransactionForm from './components/TransactionForm'
import TransactionsTable from './components/TransactionsTable'
import BudgetBar from './components/BudgetBar'
import Charts from './components/Charts'

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function App() {
  const [transactions, setTransactions] = useState([])
  const [budget, setBudget] = useState({ amount: 0 })
  const [toast, setToast] = useState(null)

  // const fetchAll = async () => {
  //   const [tx, bg] = await Promise.all([
  //     http.get(`${BASE_URL}/transactions`).then(r => r.data),
  //     http.get(`${BASE_URL}/budget/current`).then(r => r.data),
  //   ])
  //   setTransactions(tx)
  //   setBudget(bg)
  // }
  const fetchAll = async () => {
  try {
    const tx = await http.get(`${BASE_URL}/transactions`).then(r => r.data)
    setTransactions(tx)
  } catch (e) {
    console.error('GET /api/transactions 실패', e)
    alert('거래 조회 실패 (/transactions)')
  }
  try {
    const bg = await http.get(`${BASE_URL}/budget/current`).then(r => r.data)
    setBudget(bg)
  } catch (e) {
    console.error('GET /api/budget/current 실패', e)
    alert('예산 조회 실패 (/budget/current)')
  }
}


  useEffect(() => {
    connectWS()
    fetchAll()
    const off1 = onTransactionsUpdated(() => fetchAll())
    const off2 = onAlert((msg) => { setToast(msg); setTimeout(() => setToast(null), 4000) })
    return () => { off1(); off2() }
  }, [])

  const balance = useMemo(
    () => transactions.reduce((acc, t) => acc + (t.type === 'INCOME' ? t.amount : -t.amount), 0),
    [transactions]
  )

  return (
    <div className="container" style={{ maxWidth: 980, margin: '24px auto', padding: 16 }}>
      <h1>실시간 가계부</h1>
      <p>현재 잔액: <b>{balance.toLocaleString()}</b></p>

      <BudgetBar budget={budget} transactions={transactions} onUpdated={fetchAll} />
      <TransactionForm onSaved={fetchAll} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginTop: 16 }}>
        <TransactionsTable items={transactions} onChanged={fetchAll} />
        <Charts items={transactions} />
      </div>

      {toast && (
        <div role="alert"
             style={{ position: 'fixed', right: 24, bottom: 24, background: '#222', color: '#fff',
                      padding: '12px 16px', borderRadius: 8 }}>
          {toast}
        </div>
      )}
    </div>
  )
}
