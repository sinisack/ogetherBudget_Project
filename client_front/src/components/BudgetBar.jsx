import React, { useMemo, useState, useEffect } from 'react'
import http from '../api/http'

export default function BudgetBar({ budget, transactions, onUpdated }) {
  const [amount, setAmount] = useState(budget?.amount || 0)
  useEffect(() => setAmount(budget?.amount || 0), [budget])

  const spent = useMemo(
    () => transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0),
    [transactions]
  )

  const ratio = budget?.amount > 0 ? Math.min(100, Math.round((spent / budget.amount) * 100)) : 0

  const save = async () => {
    const now = new Date()
    await http.post('/budget', { year: now.getFullYear(), month: now.getMonth() + 1, amount: Number(amount) })
    onUpdated?.()
  }

  return (
    <div style={{ margin: '12px 0' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <b>월 예산</b>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} style={{ width: 160 }} />
        <button onClick={save}>저장</button>
        <span style={{ marginLeft: 'auto' }}>
          사용 {spent.toLocaleString()} / {Number(budget?.amount || 0).toLocaleString()} ({ratio}%)
        </span>
      </div>
      <div style={{ height: 10, background: '#eee', borderRadius: 6, overflow: 'hidden', marginTop: 6 }}>
        <div style={{ width: `${ratio}%`, height: '100%', background: ratio >= 80 ? '#e74c3c' : '#2ecc71' }} />
      </div>
    </div>
  )
}
