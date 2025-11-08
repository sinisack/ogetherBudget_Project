import TransactionForm from '../components/TransactionForm';
import TransactionsTable from '../components/TransactionsTable';
import CsvManagement from '../components/CsvManagement';

export default function TransactionsPage({ transactions, onTransactionsChange, setToast }) {
  return (
    <div>
      <TransactionForm onSaved={onTransactionsChange} />
      <CsvManagement transactions={transactions} onImportComplete={onTransactionsChange} setToast={setToast} />
      <TransactionsTable items={transactions} onChanged={onTransactionsChange} />
    </div>
  );
}