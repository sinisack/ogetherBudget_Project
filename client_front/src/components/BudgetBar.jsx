import { useState, useMemo, useEffect } from 'react';
import http from '../api/http';
import BudgetSummary from './BudgetSummary';
import DailyTransactionsTable from './DailyTransactionsTable';
import { formatNumber, formatDate } from '../utils/format';
import './BudgetBar.css';

export default function BudgetBar({
  transactions = [],
  currentMonth,
  numberFormat,
  dateFormat,
  selectedDate,
  dailyTransactions = [],
  onReload
}) {
  const ym = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
  const monthKey = "budget-" + ym;

  const [budget, setBudget] = useState(0);
  const [input, setInput] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(monthKey);

    if (saved != null) {
      setBudget(Number(saved));
      return;
    }

    const auto = localStorage.getItem("settings-autoApplyBudget") === "true";
    const defaultBudget = localStorage.getItem("settings-defaultBudget");

    if (auto && defaultBudget) {
      localStorage.setItem(monthKey, defaultBudget);
      setBudget(Number(defaultBudget));
    } else {
      setBudget(0);
    }
  }, [monthKey]);

  const spent = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const remaining = budget - spent;
  const percent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

  const saveBudget = async () => {
    const value = Number(input);
    if (isNaN(value) || value < 0) return;

    setBudget(value);
    localStorage.setItem(monthKey, String(value));

    try {
      await http.post('/budget', {
        month: ym,
        amount: value,
      });
    } catch {}
  };

  const renderDailyFeed = () => {
    if (!selectedDate) return null;

    return (
      <div className="daily-feed-area">
        <h4>{formatDate(selectedDate, dateFormat)} 내역</h4>   {/* ✅ 변경됨 */}

        {dailyTransactions.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 10 }}>
            내역이 없습니다.
          </p>
        ) : (
          <DailyTransactionsTable
            items={dailyTransactions}
            onChanged={onReload}
            numberFormat={numberFormat}
          />
        )}
      </div>
    );
  };

  return (
    <div className="budget-card">
      <BudgetSummary
        transactions={transactions}
        numberFormat={numberFormat}
      />

      <h3>이번 달 예산 요약</h3>

      <div className="budget-stats">
        <div><span>총 예산:</span> {formatNumber(budget, numberFormat)}원</div>
        <div><span>사용 금액:</span> {formatNumber(spent, numberFormat)}원</div>
        <div><span>남은 예산:</span> {formatNumber(remaining, numberFormat)}원</div>
      </div>

      <div className="budget-bar-wrap">
        <div className="budget-bar-bg">
          <div className="budget-bar-fill" style={{ width: `${percent}%` }}></div>
        </div>
        <small>{percent.toFixed(1)}%</small>
      </div>

      <div className="budget-input">
        <input
          type="number"
          placeholder="예산 입력"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={saveBudget}>저장</button>
      </div>

      {renderDailyFeed()}
    </div>
  );
}