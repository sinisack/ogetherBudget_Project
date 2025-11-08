import { useState, useEffect } from 'react';
import BudgetBar from '../components/BudgetBar';
import Charts from '../components/Charts';
import LiveFeed from '../components/LiveFeed';
import TransactionForm from '../components/TransactionForm';
import './DashboardLayout.css';

export default function Dashboard({ transactions, onAddTransaction }) {
  const [feedItems, setFeedItems] = useState([]);

  useEffect(() => {
    const items = transactions
      .slice()
      .reverse()
      .map(
        t =>
          `${t.type === 'INCOME' ? '수입' : '지출'}: ${t.amount.toLocaleString()}원 (${t.category})`
      );
    setFeedItems(items);
  }, [transactions]);

  const handleAddTransaction = (t) => {
    onAddTransaction(t);
  };

  return (
    <div className="dashboard">
      <div className="top-grid">
        <BudgetBar transactions={transactions} onAddTransaction={handleAddTransaction} />
      </div>

      <TransactionForm onSaved={(newTransaction) => handleAddTransaction(newTransaction)} />

      <div className="bottom-grid">
        <section className="charts-section">
          <h2>지출 분석</h2>
          <Charts transactions={transactions} />
        </section>

        <section className="feed-section">
          <LiveFeed items={feedItems} />
        </section>
      </div>
    </div>
  );
}