import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import './Charts.css';

export default function Charts({ transactions = [] }) {
  const byDay = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      if (!t.occurredAt || !t.amount) return;
      const d = new Date(t.occurredAt).toISOString().slice(0, 10);
      const v = t.type === 'INCOME' ? t.amount : -t.amount;
      map[d] = (map[d] || 0) + v;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, value }));
  }, [transactions]);

  const byCategory = useMemo(() => {
    const map = {};
    transactions
      .filter(t => t.type === 'EXPENSE')
      .forEach(t => {
        map[t.category || '기타'] = (map[t.category || '기타'] || 0) + t.amount;
      });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const COLORS = [
    '#00bcd4', '#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6',
    '#1abc9c', '#3498db', '#e67e22', '#ff9800', '#8e44ad'
  ];

  return (
    <div className="charts-container">
      <div className="chart-card">
        <h3>일자별 순변화</h3>
        <div className="chart-wrapper">
          {byDay.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={byDay}>
                <XAxis dataKey="date" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    color: '#fff'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-primary)"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              데이터가 없습니다.
            </p>
          )}
        </div>
      </div>

      <div className="chart-card">
        <h3>카테고리별 지출</h3>
        <div className="chart-wrapper">
          {byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              지출 데이터가 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}