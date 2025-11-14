import { formatNumber, formatDate } from '../utils/format';
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

  const dailyTotals = transactions.reduce((acc, t) => {
    if (!t?.occurredAt) return acc;
    const d = new Date(t.occurredAt);
    if (d.getMonth() !== month) return acc;

    const day = d.getDate();
    acc[day] = (acc[day] || 0) + (t.type === 'EXPENSE' ? t.amount : 0);
    return acc;
  }, {});

  const handleSelect = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onDateSelect?.(dateStr);
  };

  const cells = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="calendar-cell empty" />);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const total = dailyTotals[d] || 0;
    const isSelected = selectedDate && new Date(selectedDate).getDate() === d;

    cells.push(
      <div
        key={d}
        className={`calendar-cell date-cell ${isSelected ? 'selected' : ''}`}
        onClick={() => handleSelect(d)}
      >
        <span className="day-num">{d}</span>
        {total > 0 && (
          <div className="spending-info">
            <span className="dot" />
            <span className="amount">{formatNumber(total, numberFormat)}</span>
          </div>
        )}
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