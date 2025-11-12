import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { requireAuth } from '../api/auth';
import './BudgetBar.css';

const getMonthlyBudgets = () => {
  try {
    const stored = localStorage.getItem('monthlyBudgets');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading monthly budgets:', error);
    return {};
  }
};

const saveMonthlyBudgets = (budgets) => {
  try {
    localStorage.setItem('monthlyBudgets', JSON.stringify(budgets));
  } catch (error) {
    console.error('Error saving monthly budgets:', error);
  }
};

const getMonthKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function BudgetBar({ transactions = [], currentMonth }) {
  const navigate = useNavigate();
  const currentMonthKey = useMemo(() => getMonthKey(currentMonth), [currentMonth]);
  const [monthlyBudgets, setMonthlyBudgets] = useState(getMonthlyBudgets);
  const getCurrentMonthBudget = useMemo(() => {
    return monthlyBudgets[currentMonthKey] || 1000000;
  }, [monthlyBudgets, currentMonthKey]);
  const [budgetInput, setBudgetInput] = useState(getCurrentMonthBudget);
  const [budget, setBudget] = useState(getCurrentMonthBudget);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const newBudget = monthlyBudgets[currentMonthKey] ?? 1000000;
    setBudgetInput(newBudget);
    setBudget(newBudget);
    console.log(`[BudgetBar] Month changed to ${currentMonthKey}. Budget set to ${newBudget}`);
  }, [currentMonthKey]);

  useEffect(() => {
    setMonthlyBudgets(prevBudgets => {
      const currentStored = prevBudgets[currentMonthKey] ?? 1000000;
      if (currentStored === budget) return prevBudgets;
      const newBudgets = { ...prevBudgets, [currentMonthKey]: budget };
      saveMonthlyBudgets(newBudgets);
      return newBudgets;
    });
  }, [budget, currentMonthKey]);

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
    if (isNaN(newBudget) || newBudget <= 0) {
      alert('유효한 예산 금액을 입력해주세요.');
      return;
    }
    if (newBudget !== budget) {
      setBudget(newBudget);
    }
  };

  return (
    <div className="budget-bar">
      <div className="budget-bar-top">
        <label className="budget-label">예산 설정 ({currentMonthKey})</label>
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
            className={`budget-progress-bar ${remaining < 0 ? 'danger' : 'safe'
              }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
}