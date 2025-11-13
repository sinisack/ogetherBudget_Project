import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import {
  ForkKnife,
  Car,
  ShoppingBag,
  House,
  DeviceMobile,
  Heart,
  GraduationCap,
  Confetti,
  ShieldPlus,
  Money,
  Coins,
  Wallet,
  Briefcase,
  CurrencyDollar,
  Gift,
  Note,
} from 'phosphor-react';

import { CATEGORY_COLORS } from '../utils/categoryColors';
import { formatNumber } from '../utils/format';
import './Charts.css';

const ICON_MAP = {
  '식비': ForkKnife,
  '교통': Car,
  '주거/관리비': House,
  '통신': DeviceMobile,
  '쇼핑': ShoppingBag,
  '의료/건강': Heart,
  '교육': GraduationCap,
  '문화/여가': Confetti,
  '보험': ShieldPlus,
  '저축/투자': Money,
  '급여': Briefcase,
  '보너스': Gift,
  '이자소득': Coins,
  '투자수익': CurrencyDollar,
  '용돈': Wallet,
  '사업수익': Note,
  '환급금': CurrencyDollar,
  '기타': Wallet,
};

export default function Charts({ transactions = [], numberFormat }) {
  const [viewType, setViewType] = useState('EXPENSE');

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

    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
      icon: ICON_MAP[name] || ICON_MAP['기타'],
      color:
        CATEGORY_COLORS[viewType][name] ||
        CATEGORY_COLORS[viewType]['기타'],
    }));
  }, [validTransactions, viewType]);

  const totalValue = byCategory.reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="charts-container">
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

      <div className="chart-body">
        <div className="chart-visual">
          {byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="value"
                  outerRadius={110}
                  innerRadius={60}
                  paddingAngle={2}
                >
                  {byCategory.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">데이터가 없습니다.</p>
          )}

          {totalValue > 0 && (
            <div className="chart-center-label">
              <strong>{formatNumber(totalValue, numberFormat)}원</strong>
              <span>총 {viewType === 'EXPENSE' ? '지출' : '수입'}</span>
            </div>
          )}
        </div>

        <div className="chart-list">
          {byCategory.map((item, i) => {
            const IconComp = item.icon;

            return (
              <div className="chart-list-item" key={i}>
                <div className="chart-item-left">
                  <div className="icon-box" style={{ backgroundColor: item.color }}>
                    <IconComp size={18} weight="bold" />
                  </div>

                  <div className="chart-item-labels">
                    <span className="name">{item.name}</span>
                    <span className="percent">
                      {((item.value / totalValue) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="chart-item-value">
                  {formatNumber(item.value, numberFormat)}원
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}