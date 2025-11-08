import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requireAuth } from '../api/auth';
import './BudgetBar.css';

export default function BudgetBar({ onAddTransaction }) {
  const [budget, setBudget] = useState(1000000);
  const [spent, setSpent] = useState(0);
  const [input, setInput] = useState('');
  const [amount, setAmount] = useState('');
  const navigate = useNavigate();

  const remaining = budget - spent;
  const percent = Math.min((spent / budget) * 100, 100);

  const handleReset = () => {
    if (!requireAuth(navigate)) return;
    setSpent(0);
  };

  const handleAdd = () => {
    if (!requireAuth(navigate)) return;
    if (!input || !amount) return;

    const value = parseFloat(amount);
    if (isNaN(value)) return;

    onAddTransaction({ name: input, amount: value });
    setSpent(spent + value);
    setInput('');
    setAmount('');
  };

  return (
    <div className="budget-bar">
      <div className="budget-bar-top">
        <label>예산 설정:</label>
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
        />
        <button className="primary" onClick={handleReset}>초기화</button>
        <div className="budget-summary">
          남은 예산:{" "}
          <b className={remaining >= 0 ? 'balance-positive' : 'balance-negative'}>
            {remaining.toLocaleString()}원
          </b>
        </div>
      </div>

      <div className="budget-progress">
        <div
          className={`budget-progress-bar ${remaining < 0 ? 'danger' : 'safe'}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="budget-bar-top">
        <input
          type="text"
          placeholder="지출 내용"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <input
          type="number"
          placeholder="금액"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={handleAdd}>추가</button>
      </div>
    </div>
  );
}