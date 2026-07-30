import { useState } from "react";
import { Input, Select, Button } from "../../../shared/ui";

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
        <Input
          type="text"
          placeholder="Kategoriya nomi (masalan, Oziq-ovqat)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Kategoriya nomi"
        />
        <Select
          value={type}
          onChange={(e) => setType(e.target.value)}
          aria-label="Kategoriya turi"
          options={[
            { value: "expense", label: "Chiqim" },
            { value: "income", label: "Kirim" },
          ]}
        />
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          + Qo'shish
        </Button>
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
              <Button variant="ghost" onClick={() => onDelete(category.id)}>
                o'chirish
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
