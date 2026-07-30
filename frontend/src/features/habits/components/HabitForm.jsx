import { useState } from "react";
import { Input, Select, Button } from "../../../shared/ui";

// TransactionForm naqshiga muvofiq — yangi odat qo'shish formasi.
export function HabitForm({ onSubmit }) {
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [targetPerPeriod, setTargetPerPeriod] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        frequency,
        target_per_period: Number(targetPerPeriod) || 1,
      });
      setName("");
      setFrequency("daily");
      setTargetPerPeriod(1);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="habit-form" onSubmit={handleSubmit}>
      <div className="habit-form-row">
        <Input
          label="Odat nomi"
          type="text"
          placeholder="masalan, Sport qilish"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Select
          label="Chastota"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          options={[
            { value: "daily", label: "Kunlik" },
            { value: "weekly", label: "Haftalik" },
          ]}
        />
        <Input
          label={frequency === "weekly" ? "Haftada necha marta" : "Kunda necha marta"}
          type="number"
          min="1"
          max="14"
          value={targetPerPeriod}
          onChange={(e) => setTargetPerPeriod(e.target.value)}
        />
      </div>

      <Button type="submit" variant="primary" disabled={isSubmitting}>
        {isSubmitting ? "Saqlanmoqda..." : "+ Odat qo'shish"}
      </Button>
    </form>
  );
}
