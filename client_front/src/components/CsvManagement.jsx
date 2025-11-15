import { useState } from 'react';
import http from '../api/http';
import './CsvManagement.css';

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
      headers.forEach((h, j) => {
        obj[h] = cols[j].replace(/^"|"$/g, '').trim();
      });
      rows.push(obj);
    }
    return rows;
  };

  const onCsvFile = (file) => {
    const reader = new FileReader();

    reader.onload = () => {
      const buffer = reader.result;

      let utf8Text = new TextDecoder("utf-8", { fatal: false }).decode(buffer);

      const validHangul = utf8Text.match(/[\uac00-\ud7a3]/g)?.length || 0;
      const weirdChars = utf8Text.match(/[�]/g)?.length || 0;

      let finalText = utf8Text;

      if (weirdChars > validHangul) {
        console.warn("UTF-8 decoding broken → decoding as EUC-KR");
        finalText = new TextDecoder("euc-kr", { fatal: false }).decode(buffer);
      }

      try {
        const parsed = parseCSV(finalText);
        setCsvPreview(parsed);
        setToast(`CSV ${parsed.length}행 로드 완료`);
      } catch (err) {
        console.error('CSV 파싱 오류', err);
        setToast('CSV 파싱 실패');
      }

      setTimeout(() => setToast(null), 3000);
    };

    reader.readAsArrayBuffer(file);
  };

  const importCsv = async () => {
    if (!csvPreview.length) return;
    setImporting(true);
    let success = 0, fail = 0;

    for (const row of csvPreview) {
      const dateString =
        row.date || row.DATE || row.일자 || row.날짜 || row.거래일 || null;

      const occurredAt = dateString
        ? new Date(dateString).toISOString()
        : new Date().toISOString();

      const payload = {
        amount: Number(row.amount || row.AMOUNT || row.금액) || 0,
        type:
          (row.type || row.TYPE || 'EXPENSE').toUpperCase() === 'INCOME'
            ? 'INCOME'
            : 'EXPENSE',
        description: row.description || row.DESCRIPTION || row.내역 || '',
        category: row.category || row.CATEGORY || row.카테고리 || '기타',
        occurredAt,
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
      const dateStr = item.occurredAt || item.date || '';

      const values = [
        `"${dateStr}"`,
        item.type,
        item.amount,
        `"${(item.description || '').replace(/"/g, '""')}"`,
        `"${(item.category || '').replace(/"/g, '""')}"`,
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
    const dateStr = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    a.download = `가계부_거래내역_${dateStr}.csv`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="csv-container">
      <h3>CSV 데이터 관리</h3>

      <div className="csv-section">
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
        <div className="csv-preview">
          <h4>미리보기 ({csvPreview.length}행)</h4>

          <div className="csv-table-wrap">
            <table className="csv-table">
              <thead>
                <tr>
                  {Object.keys(csvPreview[0]).map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvPreview.map((r, idx) => (
                  <tr key={idx}>
                    {Object.keys(r).map((k) => (
                      <td key={k}>{r[k]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="csv-buttons">
            <button onClick={importCsv} disabled={importing}>
              {importing ? '업로드 중...' : '서버로 업로드 (행당 POST)'}
            </button>
            <button
              onClick={() => setCsvPreview([])}
              className="cancel-btn"
              disabled={importing}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CsvManagement;