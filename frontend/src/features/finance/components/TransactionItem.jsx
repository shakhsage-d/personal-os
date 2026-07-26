// TaskItem naqshiga muvofiq — ro'yxatdagi bitta tranzaksiya qatori.
export function TransactionItem({ transaction, onDelete }) {
  const sign = transaction.type === "income" ? "+" : "-";
  const amountClass =
    transaction.type === "income" ? "transaction-amount-income" : "transaction-amount-expense";

  return (
    <li className="transaction-item">
      <div className="transaction-item-main">
        <div className="transaction-item-title-row">
          <span className={amountClass}>
            {sign}
            {Number(transaction.amount).toLocaleString("uz-UZ")}
          </span>
          {transaction.category_name && (
            <span className="transaction-category-tag">{transaction.category_name}</span>
          )}
        </div>
        {transaction.description && (
          <span className="muted transaction-description">{transaction.description}</span>
        )}
      </div>

      <div className="transaction-item-actions">
        <span className="transaction-date">{transaction.occurred_on}</span>
        <button type="button" className="link-button" onClick={onDelete}>
          o'chirish
        </button>
      </div>
    </li>
  );
}
