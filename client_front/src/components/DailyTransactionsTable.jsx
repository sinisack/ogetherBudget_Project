import { useState, useMemo } from 'react';
import { formatNumber } from '../utils/format';
import TransactionManageModal from './TransactionManageModal';
import './DailyTransactionsTable.css';

export default function DailyTransactionsTable({
  items,
  onChanged,
  numberFormat
}) {
  const [visibleStart, setVisibleStart] = useState(0);

  const [selectedTx, setSelectedTx] = useState(null);

  const visibleItems = useMemo(() => {
    return items.slice(visibleStart, visibleStart + 5);
  }, [items, visibleStart]);

  const handleNext = () => {
    if (visibleStart + 5 < items.length) {
      setVisibleStart((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (visibleStart > 0) {
      setVisibleStart((prev) => prev - 1);
    }
  };

  return (
    <div className="daily-table-container">
      <table width="100%" className="daily-table">
        <thead>
          <tr>
            <th align="left">유형</th>
            <th align="left">카테고리</th>
            <th align="left">메모</th>
            <th align="right">금액</th>
            <th align="right">관리</th>
          </tr>
        </thead>

        <tbody>
          {visibleItems.map((t) => (
            <tr key={t.id}>
              <td>{t.type === 'INCOME' ? '수입' : '지출'}</td>
              <td>{t.category}</td>
              <td>{t.memo}</td>
              <td align="right">{formatNumber(t.amount, numberFormat)}원</td>
              <td align="right">
                <button onClick={() => setSelectedTx(t)}>관리</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {items.length > 5 && (
        <div className="daily-table-nav">
          <button
            className="arrow-btn"
            onClick={handlePrev}
            disabled={visibleStart === 0}
          >
            ▲
          </button>
          <button
            className="arrow-btn"
            onClick={handleNext}
            disabled={visibleStart + 5 >= items.length}
          >
            ▼
          </button>
        </div>
      )}

      {selectedTx && (
        <TransactionManageModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          onChanged={onChanged}
        />
      )}
    </div>
  );
}