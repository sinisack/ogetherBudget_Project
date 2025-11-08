import http from '../api/http';

export default function TransactionsTable({ items, onChanged }) {
  const del = async (id) => { 
    await http.delete(`/transactions/${id}`); 
    onChanged?.(); 
  };

  return (
    <table width="100%" style={{ borderCollapse: 'collapse', marginTop: 16 }}>
      <thead>
        <tr>
          <th align="left">일시</th>
          <th align="left">유형</th>
          <th align="left">카테고리</th>
          <th align="left">메모</th>
          <th align="right">금액</th>
          <th align="right">관리</th>
        </tr>
      </thead>
      <tbody>
        {items.map(t => (
          <tr key={t.id} style={{ borderTop: '1px solid #eee' }}>
            <td>{new Date(t.occurredAt).toLocaleString()}</td>
            <td>{t.type === 'INCOME' ? '수입' : '지출'}</td>
            <td>{t.category}</td>
            <td>{t.memo}</td>
            <td align="right">{t.amount.toLocaleString()}</td>
            <td align="right"><button onClick={() => del(t.id)}>삭제</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}