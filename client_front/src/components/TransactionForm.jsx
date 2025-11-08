import { useState } from 'react';
import http from '../api/http';
import './TransactionForm.css';

export default function TransactionForm({ onSaved }) {
  const [form, setForm] = useState({
    type: 'EXPENSE',
    amount: 0,
    category: 'Misc',
    memo: '',
    occurredAt: new Date().toISOString(),
  });

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    const payload = { ...form, amount: Number(form.amount) };
    await http.post('/transactions', payload);
    setForm({
      type: 'EXPENSE',
      amount: 0,
      category: 'Misc',
      memo: '',
      occurredAt: new Date().toISOString(),
    });
    onSaved?.();
  };

  return (
    <form className="transaction-form" onSubmit={submit}>
      <select name="type" value={form.type} onChange={change}>
        <option value="EXPENSE">지출</option>
        <option value="INCOME">수입</option>
      </select>
      <input name="amount" type="number" value={form.amount} onChange={change} placeholder="금액" required />
      <input name="category" value={form.category} onChange={change} placeholder="카테고리" />
      <input name="memo" value={form.memo} onChange={change} placeholder="메모" />
      <button type="submit">추가</button>
    </form>
  );
}