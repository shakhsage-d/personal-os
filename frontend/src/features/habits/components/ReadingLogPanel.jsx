import { useState } from "react";
import { Input, Select, Button } from "../../../shared/ui";

const STATUS_LABELS = {
  planned: "Rejalashtirilgan",
  reading: "O'qilmoqda",
  finished: "Tugatilgan",
};

// CategoryManager naqshiga muvofiq — "o'qigan narsalar" (kitob/maqola)
// ro'yxatini boshqarish paneli.
export function ReadingLogPanel({ logs, onCreate, onUpdateStatus, onDelete }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreate({
        title: title.trim(),
        author: author.trim() || null,
        status: "planned",
      });
      setTitle("");
      setAuthor("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="habits-side-panel reading-log-panel">
      <h3>O'qigan narsalar</h3>

      <form className="reading-log-form" onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Kitob/maqola nomi"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          aria-label="Kitob/maqola nomi"
        />
        <Input
          type="text"
          placeholder="Muallif (ixtiyoriy)"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          aria-label="Muallif"
        />
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Saqlanmoqda..." : "+ Qo'shish"}
        </Button>
      </form>

      {logs.length === 0 && <p className="muted">Hali hech narsa qo'shilmagan.</p>}

      <ul className="reading-log-list">
        {logs.map((log) => (
          <li key={log.id} className="reading-log-item">
            <div className="reading-log-item-main">
              <span className="reading-log-title">{log.title}</span>
              {log.author && <span className="muted reading-log-author"> — {log.author}</span>}
            </div>
            <div className="reading-log-item-actions">
              <Select
                value={log.status}
                onChange={(e) => onUpdateStatus(log.id, e.target.value)}
                aria-label="O'qish holati"
                options={Object.entries(STATUS_LABELS).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
              <Button variant="ghost" onClick={() => onDelete(log.id)}>
                o'chirish
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
