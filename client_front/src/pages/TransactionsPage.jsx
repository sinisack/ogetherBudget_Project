import { useEffect, useState } from 'react'
import http from '../api/http'
import TransactionForm from '../components/TransactionForm'
import TransactionsTable from '../components/TransactionsTable'
import CsvManagement from '../components/CsvManagement'

export default function TransactionsPage() {
  const [items, setItems] = useState([])
  const [toast, setToast] = useState(null)

  const load = async () => {
    const res = await http.get('/transactions')
    setItems(res.data || [])
  }

  useEffect(() => { load() }, [])

  return (
    <div style={{ padding: 24 }}>
      <h2>거래 내역 관리</h2>

      <TransactionForm onSaved={load} />
      <div style={{ marginTop: 24 }}>
        <TransactionsTable items={items} onChanged={load} />
      </div>

      <CsvManagement
        transactions={items}
        onImportComplete={load}
        setToast={setToast}
      />

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#333',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: 6,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}