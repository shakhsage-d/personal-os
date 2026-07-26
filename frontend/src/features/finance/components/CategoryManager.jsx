import { useState } from "react";

const TYPE_LABELS = { income: "Kirim", expense: "Chiqim" };

// Kategoriyalarni yaratish/o'chirish uchun ixcham panel — Goals moduli
// milestone-form naqshiga muvofiq (kichik inline forma + ro'yxat).
export function CategoryManager({ categories, onCreate, onDelete }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreate({ name: name.trim(), type });
      setName("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="finance-category-manager">
      <h3>Kategoriyalar</h3>
      <form className="category-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Kategoriya nomi (masalan, Oziq-ovqat)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="expense">Chiqim</option>
          <option value="income">Kirim</option>
        </select>
        <button type="submit" disabled={isSubmitting}>
          + Qo'shish
        </button>
      </form>

      {categories.length === 0 ? (
        <p className="muted">Hozircha kategoriya yo'q. Birinchisini qo'shing.</p>
      ) : (
        <ul className="category-list">
          {categories.map((category) => (
            <li key={category.id} className="category-list-item">
              <span className={`category-type-tag category-type-${category.type}`}>
                {TYPE_LABELS[category.type]}
              </span>
              <span className="category-name">{category.name}</span>
              <button
                type="button"
                className="link-button"
                onClick={() => onDelete(category.id)}
              >
                o'chirish
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
