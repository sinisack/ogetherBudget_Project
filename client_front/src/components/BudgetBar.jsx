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

  const totalIncome = validTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = validTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const remaining = budget + totalIncome - totalExpense;
  const totalBudget = Math.max(budget + totalIncome, 1);
  const percent = Math.min((totalExpense / totalBudget) * 100, 100);

  const handleSave = () => {
    if (!requireAuth(navigate)) return;
    const newBudget = Number(budgetInput);
    if (isNaN(newBudget) || newBudget <= 0) return;
    setBudget(newBudget);
  };

  return (
    <div className="budget-bar">
      <div className="budget-bar-top">
        <label className="budget-label">예산 설정</label>
        <input
          type="number"
          value={budgetInput}
          onChange={(e) => setBudgetInput(e.target.value)}
          className="budget-input"
        />
        <button className="primary-btn" onClick={handleSave}>
          저장
        </button>

        <div className="budget-summary">
          {loading ? (
            <span>로딩 중...</span>
          ) : (
            <>
              <span className="summary-label">남은 예산:</span>{' '}
              <b
                className={
                  remaining >= 0 ? 'balance-positive' : 'balance-negative'
                }
              >
                {Math.abs(remaining).toLocaleString()}원
              </b>
              {remaining < 0 && <span className="over-label"> (예산 초과)</span>}
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