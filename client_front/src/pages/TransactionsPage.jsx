import TransactionForm from '../components/TransactionForm';
import CsvManagement from '../components/CsvManagement';

export default function TransactionsPage({ transactions, onTransactionsChange, setToast }) {
  const numberFormat = localStorage.getItem("settings-numberFormat") || "comma";
  const dateFormat = localStorage.getItem("settings-dateFormat") || "YYYY.MM.DD";

  return (
    <div>
      <TransactionForm onSaved={onTransactionsChange} />

      <CsvManagement
        transactions={transactions}
        onImportComplete={onTransactionsChange}
        setToast={setToast}
        numberFormat={numberFormat}
        dateFormat={dateFormat}
      />
    </div>
  );
}