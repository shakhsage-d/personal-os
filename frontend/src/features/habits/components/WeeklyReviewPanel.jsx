import { useState } from "react";
import { Button } from "../../../shared/ui";

function mondayOf(d) {
  const date = new Date(d);
  const day = date.getDay(); // 0=yakshanba
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().slice(0, 10);
}

// BudgetPanel naqshiga muvofiq — haftalik o'z-o'zini baholash paneli.
export function WeeklyReviewPanel({ reviews, onCreate, onDelete }) {
  const [wins, setWins] = useState("");
  const [challenges, setChallenges] = useState("");
  const [rating, setRating] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onCreate({
        week_start_date: mondayOf(new Date()),
        wins: wins.trim() || null,
        challenges: challenges.trim() || null,
        rating: Number(rating) || null,
      });
      setWins("");
      setChallenges("");
      setRating(7);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="habits-side-panel weekly-review-panel">
      <h3>Haftalik o'z-o'zini baholash</h3>

      <form className="weekly-review-form" onSubmit={handleSubmit}>
        <textarea
          placeholder="Bu hafta nima yaxshi ketdi?"
          rows={2}
          value={wins}
          onChange={(e) => setWins(e.target.value)}
        />
        <textarea
          placeholder="Qiyinchiliklar?"
          rows={2}
          value={challenges}
          onChange={(e) => setChallenges(e.target.value)}
        />
        <label>
          Baho (1-10)
          <input
            type="number"
            min="1"
            max="10"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />
        </label>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Saqlanmoqda..." : "Shu hafta uchun saqlash"}
        </Button>
      </form>

      {reviews.length === 0 && <p className="muted">Hali baholash yo'q.</p>}

      <ul className="weekly-review-list">
        {reviews.map((review) => (
          <li key={review.id} className="weekly-review-item">
            <div className="weekly-review-item-header">
              <span className="weekly-review-week">{review.week_start_date}</span>
              {review.rating != null && (
                <span className="weekly-review-rating">{review.rating}/10</span>
              )}
              <Button variant="ghost" onClick={() => onDelete(review.id)}>
                o'chirish
              </Button>
            </div>
            {review.wins && <p className="muted weekly-review-text">✅ {review.wins}</p>}
            {review.challenges && (
              <p className="muted weekly-review-text">⚠️ {review.challenges}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
