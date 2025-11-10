import { useState } from 'react';
import http from '../api/http';
import './TransactionForm.css';

export default function TransactionForm({ onSaved }) {
  const [form, setForm] = useState({
    type: 'EXPENSE',
    amount: '',
    category: 'Misc',
    memo: '',
    occurredAt: new Date().toISOString(),
  });

  const [error, setError] = useState('');

  const change = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    const amount = Number(form.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('금액은 0보다 큰 숫자여야 합니다.');
      return;
    }

    const payload = {
      ...form,
      amount,
      category: form.category?.trim() || '기타',
      memo: form.memo?.trim() || '',
      occurredAt: form.occurredAt || new Date().toISOString(),
    };

    try {
      const res = await http.post('/transactions', payload);

      setForm({
        type: 'EXPENSE',
        amount: '',
        category: 'Misc',
        memo: '',
        occurredAt: new Date().toISOString(),
      });

      onSaved?.(res.data || payload);
    } catch (err) {
      console.error('Transaction save failed:', err);
      setError('저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <form className="transaction-form" onSubmit={submit}>
      <select name="type" value={form.type} onChange={change}>
        <option value="EXPENSE">지출</option>
        <option value="INCOME">수입</option>
      </select>

      <input
        name="amount"
        type="number"
        value={form.amount}
        onChange={change}
        placeholder="금액"
        required
        min="1"
        step="any"
      />

      <input
        name="category"
        value={form.category}
        onChange={change}
        placeholder="카테고리"
      />

      <input
        name="memo"
        value={form.memo}
        onChange={change}
        placeholder="메모"
      />

      <button type="submit">추가</button>

      {error && (
        <p className="form-error" style={{ color: 'red', marginTop: '6px' }}>
          {error}
        </p>
      )}
    </form>
  );
}