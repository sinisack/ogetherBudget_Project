import { useState } from 'react';
import http from '../api/http';

const CsvManagement = ({ transactions, onImportComplete, setToast }) => {
  const [csvPreview, setCsvPreview] = useState([]);
  const [importing, setImporting] = useState(false);

  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (!lines.length) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = [];
      let current = '', insideQuotes = false;

      for (let char of lines[i]) {
        if (char === '"') insideQuotes = !insideQuotes;
        else if (char === ',' && !insideQuotes) {
          cols.push(current);
          current = '';
        } else current += char;
      }
      cols.push(current);

      if (cols.length !== headers.length) continue;

      const obj = {};
      headers.forEach((h, j) => { obj[h] = cols[j].replace(/^"|"$/g, '').trim(); });
      rows.push(obj);
    }
    return rows;
  };

  const onCsvFile = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseCSV(reader.result);
        setCsvPreview(parsed);
        setToast(`CSV ${parsed.length}행 로드 완료`);
        setTimeout(() => setToast(null), 3000);
      } catch (err) {
        console.error('CSV 파싱 오류', err);
        setToast('CSV 파싱 실패');
        setTimeout(() => setToast(null), 3000);
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const importCsv = async () => {
    if (!csvPreview.length) return;
    setImporting(true);
    let success = 0, fail = 0;

    for (const row of csvPreview) {
      const payload = {
        amount: Number(row.amount || row.AMOUNT || row.금액) || 0,
        type: (row.type || row.TYPE || 'EXPENSE').toUpperCase() === 'INCOME' ? 'INCOME' : 'EXPENSE',
        description: row.description || row.DESCRIPTION || row.내역 || '',
        category: row.category || row.CATEGORY || row.카테고리 || '기타',
        date: row.date || row.DATE || new Date().toISOString(),
      };
      try {
        await http.post('/transactions', payload);
        success++;
      } catch (e) {
        console.error('CSV import row failed', row, e);
        fail++;
      }
    }

    setImporting(false);
    onImportComplete?.();
    setCsvPreview([]);

    const msg = `CSV import 완료: 성공 ${success}, 실패 ${fail}`;
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const toCSV = (items) => {
    if (!items.length) return '';
    const headers = ['date', 'type', 'amount', 'description', 'category'];
    const headerRow = headers.join(',');

    const dataRows = items.map(item => {
      const dateStr = item.date
        ? new Date(item.date).toLocaleString('ko-KR', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit'
        })
        : '';
      const values = [
        `"${dateStr}"`,
        item.type,
        item.amount,
        `"${(item.description || '').replace(/"/g, '""')}"`,
        `"${(item.category || '').replace(/"/g, '""')}"`
      ];
      return values.join(',');
    });

    return [headerRow, ...dataRows].join('\n');
  };

  const downloadCsv = () => {
    const csvData = toCSV(transactions);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    a.download = `가계부_거래내역_${dateStr}.csv`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ marginTop: 16, borderTop: '1px dashed #ddd', paddingTop: 12 }}>
      <h3>CSV 데이터 관리</h3>

      <div style={{ marginBottom: 16 }}>
        <button onClick={downloadCsv} disabled={transactions.length === 0}>
          거래 내역 CSV 다운로드 ({transactions.length}건)
        </button>
      </div>

      <h4>CSV 업로드 (미리보기)</h4>
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => e.target.files?.[0] && onCsvFile(e.target.files[0])}
      />

      {csvPreview.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <h4>미리보기 ({csvPreview.length}행)</h4>
          <div style={{ maxHeight: 200, overflow: 'auto', border: '1px solid #eee', padding: 8 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr>
                  {Object.keys(csvPreview[0]).map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: 4, borderBottom: '1px solid #f0f0f0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvPreview.map((r, idx) => (
                  <tr key={idx}>
                    {Object.keys(r).map((k) => (
                      <td key={k} style={{ padding: 4, borderBottom: '1px solid #fafafa' }}>{r[k]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 8 }}>
            <button onClick={importCsv} disabled={importing}>
              {importing ? '업로드 중...' : '서버로 업로드 (행당 POST)'}
            </button>
            <button onClick={() => setCsvPreview([])} style={{ marginLeft: 8 }} disabled={importing}>취소</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CsvManagement;