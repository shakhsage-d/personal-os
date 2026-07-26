import { useMemo, useState } from "react";

const today = () => new Date().toISOString().slice(0, 10);

// Task moduli TaskForm naqshiga muvofiq — kategoriya turi tanlansa,
// faqat shu turdagi kategoriyalar ro'yxatda ko'rsatiladi (backend
// `create_transaction` tur-kategoriya mosligini talab qiladi).
export function TransactionForm({ categories, onSubmit }) {
  const [type, setType] = useState("expense");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [occurredOn, setOccurredOn] = useState(today());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type]
  );

  async function handleSubmit(e) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        type,
        category_id: categoryId || null,
        amount: Number(amount),
        description: description.trim() || null,
        occurred_on: occurredOn,
      });
      setAmount("");
      setDescription("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      <div className="transaction-form-row">
        <label>
          Turi
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setCategoryId("");
            }}
          >
            <option value="expense">Chiqim</option>
            <option value="income">Kirim</option>
          </select>
        </label>
        <label>
          Kategoriya
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Kategoriyasiz</option>
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="transaction-form-row">
        <label>
          Summa
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </label>
        <label>
          Sana
          <input
            type="date"
            value={occurredOn}
            onChange={(e) => setOccurredOn(e.target.value)}
            required
          />
        </label>
      </div>

      <textarea
        placeholder="Izoh (ixtiyoriy)"
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saqlanmoqda..." : "+ Tranzaksiya qo'shish"}
      </button>
    </form>
  );
}
