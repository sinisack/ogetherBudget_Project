import { formatNumber } from '../utils/format';
import './CalendarView.css';

export default function CalendarView({
  transactions = [],
  selectedDate,
  onDateSelect,
  numberFormat,
  dateFormat
}) {
  const now = new Date();
  const baseDate = selectedDate ? new Date(selectedDate) : now;
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

  const dailyStats = transactions.reduce((acc, t) => {
    if (!t?.occurredAt) return acc;

    const d = new Date(t.occurredAt);
    if (d.getFullYear() !== year || d.getMonth() !== month) return acc;

    const day = d.getDate();

    if (!acc[day]) {
      acc[day] = { expense: 0, income: 0 };
    }

    if (t.type === 'EXPENSE') acc[day].expense += t.amount;
    if (t.type === 'INCOME') acc[day].income += t.amount;

    return acc;
  }, {});

  const handleSelect = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
      day
    ).padStart(2, '0')}`;
    onDateSelect?.(dateStr);
  };

  const cells = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="calendar-cell empty" />);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const stat = dailyStats[d] || { expense: 0, income: 0 };

    const isSelected =
      selectedDate &&
      new Date(selectedDate).getFullYear() === year &&
      new Date(selectedDate).getMonth() === month &&
      new Date(selectedDate).getDate() === d;

    cells.push(
      <div
        key={d}
        className={`calendar-cell date-cell ${isSelected ? 'selected' : ''}`}
        onClick={() => handleSelect(d)}
      >
        <span className="day-num">{d}</span>

        <div className="spending-info">
          {stat.expense > 0 && (
            <span className="amount amount-expense">
              {formatNumber(stat.expense, numberFormat)}
            </span>
          )}

          {stat.income > 0 && (
            <span className="amount amount-income">
              {formatNumber(stat.income, numberFormat)}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <div className="weekday-row">
        {WEEKDAYS.map((w) => (
          <div key={w} className="weekday">
            {w}
          </div>
        ))}
      </div>
      <div className="calendar-grid">{cells}</div>
    </div>
  );
}