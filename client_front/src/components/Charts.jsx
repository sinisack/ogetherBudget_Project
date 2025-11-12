import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { CATEGORY_COLORS } from '../utils/categoryColors';
import './Charts.css';

export default function Charts({ transactions = [] }) {
  const [viewType, setViewType] = useState('EXPENSE'); // 'EXPENSE' | 'INCOME'

  const validTransactions = Array.isArray(transactions)
    ? transactions.filter(
      (t) =>
        t &&
        typeof t.amount === 'number' &&
        typeof t.type === 'string' &&
        t.occurredAt
    )
    : [];

  const byCategory = useMemo(() => {
    const map = {};
    validTransactions
      .filter((t) => t.type === viewType)
      .forEach((t) => {
        const key = t.category || '기타';
        map[key] = (map[key] || 0) + t.amount;
      });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [validTransactions, viewType]);

  const colors = CATEGORY_COLORS[viewType];

  return (
    <div className="charts-container single">
      <div className="chart-card">
        <div className="chart-header">
          <h3>{viewType === 'EXPENSE' ? '지출' : '수입'} 카테고리별 현황</h3>
          <div className="chart-tabs">
            <button
              className={viewType === 'EXPENSE' ? 'active' : ''}
              onClick={() => setViewType('EXPENSE')}
            >
              지출
            </button>
            <button
              className={viewType === 'INCOME' ? 'active' : ''}
              onClick={() => setViewType('INCOME')}
            >
              수입
            </button>
          </div>
        </div>

        <div className="chart-wrapper">
          {byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {byCategory.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={colors[entry.name] || colors['기타']}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              데이터가 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}