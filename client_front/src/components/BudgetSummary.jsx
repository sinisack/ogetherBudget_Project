import { formatNumber } from "../utils/format";
import './BudgetSummary.css';

export default function BudgetSummary({ transactions = [], numberFormat }) {
  const income = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((s, t) => s + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((s, t) => s + t.amount, 0);

  const net = income - expense;

  const netColor =
    net > 0
      ? 'var(--color-success)'
      : net < 0
        ? 'var(--color-danger)'
        : 'var(--color-text-secondary)';

  return (
    <div className="summary-bar">
      <div className="box">
        <span className="label">총 수입</span>
        <span className="value" style={{ color: 'var(--color-success)' }}>
          +{formatNumber(income, numberFormat)}원
        </span>
      </div>

      <div className="box">
        <span className="label">총 지출</span>
        <span className="value" style={{ color: 'var(--color-danger)' }}>
          -{formatNumber(expense, numberFormat)}원
        </span>
      </div>

      <div className="box">
        <span className="label">순 사용 금액</span>
        <span className="value" style={{ color: netColor }}>
          {formatNumber(net, numberFormat)}원
        </span>
      </div>
    </div>
  );
}