import React, { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

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
    items.filter(t => t.type === 'EXPENSE').forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [items])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div style={{ height: 260, border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
        <h3>일자별 순변화</h3>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={byDay}>
            <XAxis dataKey="date" /><YAxis /><Tooltip />
            <Line type="monotone" dataKey="value" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ height: 260, border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
        <h3>카테고리별 지출</h3>
        <ResponsiveContainer width="100%" height="90%">
          <PieChart>
            <Pie data={byCategory} dataKey="value" nameKey="name" outerRadius={80} label>
              {byCategory.map((_, i) => (<Cell key={i} />))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
