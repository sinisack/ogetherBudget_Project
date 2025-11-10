import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requireAuth } from '../api/auth';
import './BudgetBar.css';

export default function BudgetBar({ transactions = [] }) {
  const navigate = useNavigate();

  const [budgetInput, setBudgetInput] = useState(
    () => Number(localStorage.getItem('budget')) || 1000000
  );
  const [budget, setBudget] = useState(budgetInput);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('budget', budget);
  }, [budget]);

  useEffect(() => {
    setLoading(false);
  }, [transactions]);

  const validTransactions = Array.isArray(transactions)
    ? transactions.filter(
        (t) => t && typeof t.type === 'string' && typeof t.amount === 'number'
      )
    : [];

  if (process.env.NODE_ENV === 'development') {
    if (transactions.some((t) => t == null)) {
      console.warn('⚠️ transactions contains null/undefined:', transactions);
    }
  }

  const totalIncome = validTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = validTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const remaining = budget + totalIncome - totalExpense;

  const totalBudget = Math.max(budget + totalIncome, 1);
  let percent = totalExpense > 0 ? (totalExpense / totalBudget) * 100 : 0;
  percent = Math.min(percent, 100);

  const handleSave = () => {
    if (!requireAuth(navigate)) return;
    const newBudget = Number(budgetInput);
    if (isNaN(newBudget) || newBudget <= 0) return;
    setBudget(newBudget);
  };

  return (
    <div className="budget-bar">
      <div className="budget-bar-top">
        <label>예산 설정:</label>
        <input
          type="number"
          value={budgetInput}
          onChange={(e) => setBudgetInput(e.target.value)}
          className="budget-input"
        />
        <button className="primary" onClick={handleSave}>
          저장
        </button>

        <div className="budget-summary">
          {loading ? (
            <span>로딩 중...</span>
          ) : (
            <>
              남은 예산:{' '}
              <b
                className={
                  remaining >= 0 ? 'balance-positive' : 'balance-negative'
                }
              >
                {remaining.toLocaleString()}원
              </b>
            </>
          )}
        </div>
      </div>

      {!loading && (
        <div className="budget-progress">
          <div
            className={`budget-progress-bar ${
              remaining < 0 ? 'danger' : 'safe'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
}