import ReactECharts from "echarts-for-react";

// ECharts tanlovi — qoshimcha-qarorlar.md, 2-bo'lim: "katta hajmdagi
// moliyaviy ma'lumotni yumshoq render qilish, zoom/brush/data-sampling
// kabi funksiyalar tayyor holda mavjudligi, va performance ustunligi
// sababli".

const EXPENSE_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981",
  "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#64748b",
];

export function CategoryBreakdownChart({ byCategory }) {
  const expenseItems = byCategory.filter((item) => item.type === "expense");

  if (expenseItems.length === 0) {
    return <p className="muted">Shu oyda chiqim ma'lumoti yo'q — grafik uchun kamida bitta chiqim kerak.</p>;
  }

  const option = {
    tooltip: { trigger: "item", valueFormatter: (v) => Number(v).toLocaleString("uz-UZ") },
    legend: { orient: "vertical", right: 0, top: "middle", textStyle: { fontSize: 11 } },
    series: [
      {
        name: "Chiqim",
        type: "pie",
        radius: ["40%", "70%"],
        center: ["38%", "50%"],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: "#fff", borderWidth: 2 },
        label: { formatter: "{b}\n{d}%", fontSize: 11 },
        data: expenseItems.map((item, index) => ({
          name: item.category_name,
          value: Number(item.total),
          itemStyle: { color: EXPENSE_COLORS[index % EXPENSE_COLORS.length] },
        })),
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 320, width: "100%" }} notMerge />;
}

export function MonthlyTrendChart({ months }) {
  const hasData = months.some((m) => Number(m.total_income) > 0 || Number(m.total_expense) > 0);
  if (!hasData) {
    return <p className="muted">Shu yil uchun hali tranzaksiya yo'q — grafik uchun ma'lumot kerak.</p>;
  }

  const monthLabels = months.map((m) => `${m.month}-oy`);

  const option = {
    tooltip: { trigger: "axis", valueFormatter: (v) => Number(v).toLocaleString("uz-UZ") },
    legend: { data: ["Kirim", "Chiqim"], top: 0 },
    grid: { left: 50, right: 20, top: 40, bottom: 30 },
    xAxis: { type: "category", data: monthLabels, axisLabel: { fontSize: 10 } },
    yAxis: { type: "value", axisLabel: { fontSize: 10 } },
    series: [
      {
        name: "Kirim",
        type: "bar",
        data: months.map((m) => Number(m.total_income)),
        itemStyle: { color: "#10b981", borderRadius: [4, 4, 0, 0] },
      },
      {
        name: "Chiqim",
        type: "bar",
        data: months.map((m) => Number(m.total_expense)),
        itemStyle: { color: "#ef4444", borderRadius: [4, 4, 0, 0] },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 300, width: "100%" }} notMerge />;
}
