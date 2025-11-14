import { useMemo } from 'react';
import { CATEGORY_COLORS } from '../utils/categoryColors';
import { formatNumber } from '../utils/format';
import { ICON_MAP } from '../utils/iconMap';
import CsvManagement from '../components/CsvManagement';
import './YearlySummary.css';

export default function YearlySummary({ transactions = [], onTransactionsChange, setToast }) {
  const numberFormat = localStorage.getItem('settings-numberFormat') || 'comma';
  const dateFormat = localStorage.getItem('settings-dateFormat') || 'YYYY.MM.DD';

  const byYear = useMemo(() => {
    const map = {};

    transactions.forEach((t) => {
      if (!t || !t.occurredAt) return;
      const y = new Date(t.occurredAt).getFullYear();

      if (!map[y])
        map[y] = {
          income: 0,
          expense: 0,
          incomeCategories: {},
          expenseCategories: {},
        };

      if (t.type === 'INCOME') {
        map[y].income += t.amount;
        const cat = t.category || '기타';
        map[y].incomeCategories[cat] =
          (map[y].incomeCategories[cat] || 0) + t.amount;
      }

      if (t.type === 'EXPENSE') {
        map[y].expense += t.amount;
        const cat = t.category || '기타';
        map[y].expenseCategories[cat] =
          (map[y].expenseCategories[cat] || 0) + t.amount;
      }
    });

    return map;
  }, [transactions]);

  const now = new Date().getFullYear();
  const years = [now, now - 1];

  const getTop3 = (obj) =>
    Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <div className="ys-container">
      <h2 className="ys-title">연도별 카테고리 요약</h2>

      {years.map((y) => {
        const data = byYear[y];

        if (!data)
          return (
            <div key={y} className="ys-year-card">
              <h3 className="ys-year-title">{y}년</h3>
              <p className="ys-empty">데이터가 없습니다.</p>
            </div>
          );

        const topIncome = getTop3(data.incomeCategories);
        const topExpense = getTop3(data.expenseCategories);

        return (
          <div key={y} className="ys-year-card">
            <h3 className="ys-year-title">{y}년</h3>

            <div className="ys-row">
              총 수입: {formatNumber(data.income, numberFormat)}원
            </div>
            <div className="ys-row">
              총 지출: {formatNumber(data.expense, numberFormat)}원
            </div>

            <div className="ys-top3-wrap">
              <strong>수입 TOP 3 카테고리</strong>
              {topIncome.length === 0 ? (
                <p className="ys-empty">데이터 없음</p>
              ) : (
                <ul className="ys-top3-list">
                  {topIncome.map(([cat, amount]) => {
                    const Icon = ICON_MAP[cat] || ICON_MAP['기타'];
                    const color =
                      CATEGORY_COLORS.INCOME[cat] ||
                      CATEGORY_COLORS.INCOME['기타'];

                    return (
                      <li key={cat} className="ys-top3-item">
                        <span
                          className="ys-top3-icon"
                          style={{ backgroundColor: color }}
                        >
                          <Icon size={18} weight="bold" />
                        </span>
                        <span className="ys-top3-name">{cat}</span>
                        <span className="ys-top3-amount">
                          {formatNumber(amount, numberFormat)}원
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="ys-top3-wrap">
              <strong>지출 TOP 3 카테고리</strong>
              {topExpense.length === 0 ? (
                <p className="ys-empty">데이터 없음</p>
              ) : (
                <ul className="ys-top3-list">
                  {topExpense.map(([cat, amount]) => {
                    const Icon = ICON_MAP[cat] || ICON_MAP['기타'];
                    const color =
                      CATEGORY_COLORS.EXPENSE[cat] ||
                      CATEGORY_COLORS.EXPENSE['기타'];

                    return (
                      <li key={cat} className="ys-top3-item">
                        <span
                          className="ys-top3-icon"
                          style={{ backgroundColor: color }}
                        >
                          <Icon size={18} weight="bold" />
                        </span>
                        <span className="ys-top3-name">{cat}</span>
                        <span className="ys-top3-amount">
                          {formatNumber(amount, numberFormat)}원
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        );
      })}

      <CsvManagement
        transactions={transactions}
        onImportComplete={onTransactionsChange}
        setToast={setToast}
        numberFormat={numberFormat}
        dateFormat={dateFormat}
      />
    </div>
  );
}