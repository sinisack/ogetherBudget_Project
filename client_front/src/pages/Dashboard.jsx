import { useMemo, useState, useEffect } from 'react';
import BudgetBar from '../components/BudgetBar';
import Charts from '../components/Charts';
import LiveFeed from '../components/LiveFeed';
import TransactionForm from '../components/TransactionForm';
import CalendarView from '../components/CalendarView';
import './Dashboard.css';

export default function Dashboard({ transactions = [], onAddTransaction }) {
  const [feedItems, setFeedItems] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const numberFormat = localStorage.getItem("settings-numberFormat") || "comma";
  const dateFormat = localStorage.getItem("settings-dateFormat") || "YYYY.MM.DD";

  const safeTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    return transactions.filter(
      (t) =>
        t &&
        typeof t.amount === 'number' &&
        typeof t.type === 'string' &&
        t.occurredAt
    );
  }, [transactions]);

  const monthlyTransactions = useMemo(() => {
    return safeTransactions.filter((t) => {
      const d = new Date(t.occurredAt);
      return (
        d.getFullYear() === currentMonth.getFullYear() &&
        d.getMonth() === currentMonth.getMonth()
      );
    });
  }, [safeTransactions, currentMonth]);

  useEffect(() => {
    const items = monthlyTransactions
      .slice()
      .reverse()
      .map(
        (t) =>
          `${t.type === 'INCOME' ? '수입' : '지출'}: ${t.amount.toLocaleString()}원 (${t.category || '기타'})`
      );
    setFeedItems(items);
  }, [monthlyTransactions]);

  const handleAddTransaction = (t) => {
    if (!t || typeof t.amount !== 'number' || !t.type) return;
    onAddTransaction(t);
  };

  const handleMonthChange = (offset) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() + offset);
    setSelectedDate(null);
    setCurrentMonth(newDate);
  };

  return (
    <div className="dashboard">
      <div className="top-grid">
        <section className="card-section">
          <BudgetBar
            transactions={monthlyTransactions}
            currentMonth={currentMonth}
            numberFormat={numberFormat}
          />
        </section>

        <section className="card-section calendar-section">
          <div className="calendar-header">
            <button onClick={() => handleMonthChange(-1)}>◀</button>
            <h2>
              {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
            </h2>
            <button onClick={() => handleMonthChange(1)}>▶</button>
          </div>
          <CalendarView
            transactions={monthlyTransactions}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            numberFormat={numberFormat}
            dateFormat={dateFormat}
          />
        </section>
      </div>

      <section className="card-section form-section">
        <TransactionForm onSaved={handleAddTransaction} />
      </section>

      <div className="bottom-grid">
        <section className="card-section charts-section">
          <Charts
            transactions={monthlyTransactions}
            numberFormat={numberFormat}
          />
        </section>

        <section className="card-section feed-section">
          <LiveFeed
            items={feedItems}
            dateFormat={dateFormat}
          />
        </section>
      </div>
    </div>
  );
}