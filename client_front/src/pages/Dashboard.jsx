import { useMemo, useState } from 'react';
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
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const numberFormat = localStorage.getItem('settings-numberFormat') || 'comma';
  const dateFormat = localStorage.getItem('settings-dateFormat') || 'YYYY.MM.DD';

  const years = useMemo(() => {
    const start = 1970;
    const end = new Date().getFullYear();
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, []);

  const safeTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    return transactions.filter((t) => t && typeof t.amount === 'number' && t.occurredAt);
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
    const newStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(d.getDate()).padStart(2, '0')}`;
    setSelectedDate(newStr);
  };

  const updateYearMonth = (year, monthIndex) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(year);
    newDate.setMonth(monthIndex);
    setCurrentMonth(newDate);

    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`;
    setSelectedDate(dateStr);
  };

  const handleYearSelectChange = (e) => {
    const year = Number(e.target.value);
    updateYearMonth(year, currentMonth.getMonth());
  };

  const handleMonthSelectChange = (e) => {
    const monthIndex = Number(e.target.value) - 1;
    updateYearMonth(currentMonth.getFullYear(), monthIndex);
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

          <div className="calendar-footer">
            <div className="calendar-footer-group">
              <label>연도</label>
              <select
                value={currentMonth.getFullYear()}
                onChange={handleYearSelectChange}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}년
                  </option>
                ))}
              </select>
            </div>

            <div className="calendar-footer-group">
              <label>월</label>
              <select value={currentMonth.getMonth() + 1} onChange={handleMonthSelectChange}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m}월
                  </option>
                ))}
              </select>
            </div>
          </div>
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