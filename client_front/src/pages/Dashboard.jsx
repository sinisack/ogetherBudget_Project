import { useState, useEffect, useMemo } from 'react';
import BudgetBar from '../components/BudgetBar';
import Charts from '../components/Charts';
import LiveFeed from '../components/LiveFeed';
import TransactionForm from '../components/TransactionForm';
import './DashboardLayout.css';

export default function Dashboard({ transactions = [], onAddTransaction }) {
  const [feedItems, setFeedItems] = useState([]);

  const safeTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    return transactions.filter(
      (t) =>
        t &&
        typeof t.amount === 'number' &&
        typeof t.type === 'string' &&
        t.occurredAt
    );
  }, [transactions]);

  useEffect(() => {
    const items = safeTransactions
      .slice()
      .reverse()
      .map(
        (t) =>
          `${t.type === 'INCOME' ? '수입' : '지출'}: ${t.amount.toLocaleString()}원 (${t.category || '기타'})`
      );
    setFeedItems(items);
  }, [safeTransactions]);

  const handleAddTransaction = (t) => {
    if (!t || typeof t.amount !== 'number' || !t.type) return;
    onAddTransaction(t);
  };

  return (
    <div className="dashboard">
      <div className="top-grid">
        <BudgetBar transactions={safeTransactions} onAddTransaction={handleAddTransaction} />
      </div>

      <TransactionForm onSaved={handleAddTransaction} />

      <div className="bottom-grid">
        <section className="charts-section">
          <h2>지출 분석</h2>
          <Charts transactions={safeTransactions} />
        </section>

        <section className="feed-section">
          <LiveFeed items={feedItems} />
        </section>
      </div>
    </div>
  );
}