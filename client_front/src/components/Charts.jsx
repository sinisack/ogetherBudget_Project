import React, { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import './Charts.css'

export default function Charts({ items }) {
  const byDay = useMemo(() => {
    const map = {}
    items.forEach(t => {
      const d = new Date(t.occurredAt).toISOString().slice(0, 10)
      const v = t.type === 'INCOME' ? t.amount : -t.amount
      map[d] = (map[d] || 0) + v
    })
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, value }))
  }, [items])

  const byCategory = useMemo(() => {
    const map = {}
    items
      .filter(t => t.type === 'EXPENSE')
      .forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [items])

  const COLORS = [
    '#00bcd4', '#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6',
    '#1abc9c', '#3498db', '#e67e22', '#ff9800', '#8e44ad'
  ]

  return (
    <div className="charts-container">
      <div className="chart-card">
        <h3>일자별 순변화</h3>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={byDay}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="var(--color-primary)" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card">
        <h3>카테고리별 지출</h3>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={byCategory}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                label
              >
                {byCategory.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}