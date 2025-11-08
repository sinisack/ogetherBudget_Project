import { useState } from 'react';
import BudgetBar from '../components/BudgetBar';
import Charts from '../components/Charts';
import LiveFeed from '../components/LiveFeed';
import './DashboardLayout.css';

export default function Dashboard() {
  const [feedItems, setFeedItems] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const handleAddTransaction = (t) => {
    setTransactions([...transactions, t]);
    setFeedItems([
      `${t.name} 지출 ${t.amount.toLocaleString()}원`,
      ...feedItems,
    ]);
  };

  return (
    <div className="dashboard">
      <div className="top-grid">
        <h2>예산 관리</h2>
        <BudgetBar onAddTransaction={handleAddTransaction} />
      </div>

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