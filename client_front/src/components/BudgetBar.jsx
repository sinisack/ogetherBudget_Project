import { useMemo, useState, useEffect } from 'react'
import http from '../api/http'
import './BudgetBar.css'

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
    <div className="budget-bar">
      <div className="budget-bar-top">
        <b>월 예산</b>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="budget-input"
        />
        <button className="primary" onClick={save}>저장</button>
        <span className="budget-summary">
          사용 {spent.toLocaleString()} / {Number(budget?.amount || 0).toLocaleString()} ({ratio}%)
        </span>
      </div>

      <div className="budget-progress">
        <div
          className={`budget-progress-bar ${ratio >= 80 ? 'danger' : 'safe'}`}
          style={{ width: `${ratio}%` }}
        />
      </div>
    </div>
  )
}