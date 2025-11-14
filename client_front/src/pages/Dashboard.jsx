import { useMemo, useState, useEffect } from 'react';
import BudgetBar from '../components/BudgetBar';
import Charts from '../components/Charts';
import TransactionForm from '../components/TransactionForm';
import CalendarView from '../components/CalendarView';
import './Dashboard.css';

export default function Dashboard({
  transactions = [],
  onAddTransaction,
  onTransactionsChange,
}) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const numberFormat = localStorage.getItem("settings-numberFormat") || "comma";
  const dateFormat = localStorage.getItem("settings-dateFormat") || "YYYY.MM.DD";

  const safeTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    return transactions.filter(
      t => t && typeof t.amount === "number" && t.occurredAt
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

  const dailyTransactions = useMemo(() => {
    return monthlyTransactions.filter((t) => {
      const d = t.occurredAt.slice(0, 10);
      return d === selectedDate;
    });
  }, [monthlyTransactions, selectedDate]);

  const handleMonthChange = (offset) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() + offset);
    setCurrentMonth(newDate);

    const d = new Date(newDate);
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setSelectedDate(todayStr);
  };

  return (
    <div className="dashboard">
      <div className="top-grid">
        <section className="card-section">
          <BudgetBar
            transactions={monthlyTransactions}
            currentMonth={currentMonth}
            numberFormat={numberFormat}
            selectedDate={selectedDate}
            dailyTransactions={dailyTransactions}
            onReload={onTransactionsChange}
          />
        </section>

        <section className="card-section calendar-section">
          <div className="calendar-header">
            <button onClick={() => handleMonthChange(-1)}>◀</button>
            <h2>{currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월</h2>
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
        <TransactionForm onSaved={onAddTransaction} />
      </section>

      <div className="bottom-grid">
        <section className="card-section charts-section">
          <Charts transactions={monthlyTransactions} numberFormat={numberFormat} />
        </section>
      </div>
    </div>
  );
}