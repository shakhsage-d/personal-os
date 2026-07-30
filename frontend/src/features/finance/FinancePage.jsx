import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../shared/auth/AuthContext";
import { Spinner, EmptyState, ErrorBanner } from "../../shared/ui/Feedback";
import { Button, Input, Select } from "../../shared/ui";
import { createFinanceApi } from "./api";
import { CategoryManager } from "./components/CategoryManager";
import { TransactionForm } from "./components/TransactionForm";
import { TransactionItem } from "./components/TransactionItem";
import { BudgetPanel } from "./components/BudgetPanel";
import { SavingsGoalPanel } from "./components/SavingsGoalPanel";
import { CategoryBreakdownChart, MonthlyTrendChart } from "./components/FinanceCharts";

const now = new Date();

export function FinancePage() {
  const { authFetch } = useAuth();
  const financeApi = useMemo(() => createFinanceApi(authFetch), [authFetch]);

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "expense"),
    [categories]
  );

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [categoriesData, summaryData, trendData, budgetsData, savingsData] =
        await Promise.all([
          financeApi.categories.list(),
          financeApi.getSummary({ year, month }),
          financeApi.getTrend({ year }),
          financeApi.budgets.list({ year, month }),
          financeApi.savingsGoals.list(),
        ]);
      setCategories(categoriesData);
      setSummary(summaryData);
      setTrend(trendData);
      setBudgets(budgetsData);
      setSavingsGoals(savingsData);

      const transactionsData = await financeApi.transactions.list({
        dateFrom: `${year}-${String(month).padStart(2, "0")}-01`,
        dateTo: `${year}-${String(month).padStart(2, "0")}-31`,
      });
      setTransactions(transactionsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [financeApi, year, month]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleCreateCategory(payload) {
    try {
      await financeApi.categories.create(payload);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteCategory(categoryId) {
    try {
      await financeApi.categories.remove(categoryId);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreateTransaction(payload) {
    try {
      await financeApi.transactions.create(payload);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteTransaction(transactionId) {
    try {
      await financeApi.transactions.remove(transactionId);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreateBudget(payload) {
    try {
      await financeApi.budgets.create(payload);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteBudget(budgetId) {
    try {
      await financeApi.budgets.remove(budgetId);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreateSavingsGoal(payload) {
    try {
      await financeApi.savingsGoals.create(payload);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdateSavingsGoal(goalId, payload) {
    try {
      await financeApi.savingsGoals.update(goalId, payload);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteSavingsGoal(goalId) {
    try {
      await financeApi.savingsGoals.remove(goalId);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  const visibleTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let list = transactions;
    if (query) {
      list = list.filter(
        (t) =>
          (t.description || "").toLowerCase().includes(query) ||
          (t.category_name || "").toLowerCase().includes(query)
      );
    }
    if (categoryFilter) {
      list = list.filter((t) => String(t.category_id) === categoryFilter);
    }
    list = [...list];
    switch (sortBy) {
      case "date_asc":
        list.sort((a, b) => a.occurred_on.localeCompare(b.occurred_on));
        break;
      case "amount_desc":
        list.sort((a, b) => Number(b.amount) - Number(a.amount));
        break;
      case "amount_asc":
        list.sort((a, b) => Number(a.amount) - Number(b.amount));
        break;
      default:
        list.sort((a, b) => b.occurred_on.localeCompare(a.occurred_on));
    }
    return list;
  }, [transactions, searchQuery, categoryFilter, sortBy]);

  function shiftMonth(delta) {
    let nextMonth = month + delta;
    let nextYear = year;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    } else if (nextMonth < 1) {
      nextMonth = 12;
      nextYear -= 1;
    }
    setMonth(nextMonth);
    setYear(nextYear);
  }

  return (
    <div className="finance-page">
      <div className="finance-toolbar">
        <div className="finance-month-nav">
          <Button variant="ghost" onClick={() => shiftMonth(-1)}>
            &larr;
          </Button>
          <span className="finance-month-title">
            {year}-{String(month).padStart(2, "0")}
          </span>
          <Button variant="ghost" onClick={() => shiftMonth(1)}>
            &rarr;
          </Button>
        </div>
        <Button variant="ghost" onClick={() => setShowCategoryManager((v) => !v)}>
          {showCategoryManager ? "Kategoriyalarni yashirish" : "Kategoriyalarni boshqarish"}
        </Button>
      </div>

      <ErrorBanner message={error} onRetry={loadAll} />
      {isLoading && <Spinner />}

      {showCategoryManager && (
        <CategoryManager
          categories={categories}
          onCreate={handleCreateCategory}
          onDelete={handleDeleteCategory}
        />
      )}

      {summary && (
        <div className="finance-summary-cards">
          <div className="finance-summary-card finance-summary-income">
            <span className="finance-summary-label">Kirim</span>
            <span className="finance-summary-value">
              {Number(summary.total_income).toLocaleString("uz-UZ")}
            </span>
          </div>
          <div className="finance-summary-card finance-summary-expense">
            <span className="finance-summary-label">Chiqim</span>
            <span className="finance-summary-value">
              {Number(summary.total_expense).toLocaleString("uz-UZ")}
            </span>
          </div>
          <div
            className={`finance-summary-card ${
              Number(summary.net) >= 0 ? "finance-summary-net-positive" : "finance-summary-net-negative"
            }`}
          >
            <span className="finance-summary-label">Sof qoldiq</span>
            <span className="finance-summary-value">
              {Number(summary.net).toLocaleString("uz-UZ")}
            </span>
          </div>
        </div>
      )}

      <div className="finance-charts-row">
        <div className="finance-chart-box">
          <h3>Kategoriya bo'yicha chiqim</h3>
          {summary && <CategoryBreakdownChart byCategory={summary.by_category} />}
        </div>
        <div className="finance-chart-box">
          <h3>{year}-yil bo'yicha oylik dinamika</h3>
          {trend && <MonthlyTrendChart months={trend.months} />}
        </div>
      </div>

      <div className="finance-main-grid">
        <div className="finance-transactions-column">
          <h3>Tranzaksiyalar</h3>
          <TransactionForm categories={categories} onSubmit={handleCreateTransaction} />

          <div className="finance-transactions-toolbar">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tavsif yoki kategoriya bo'yicha qidirish..."
              aria-label="Tranzaksiyalarni qidirish"
              className="finance-search-input"
            />
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Kategoriya bo'yicha filtr"
              options={[
                { value: "", label: "Barcha kategoriyalar" },
                ...categories.map((c) => ({ value: String(c.id), label: c.name })),
              ]}
            />
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Saralash"
              options={[
                { value: "date_desc", label: "Sana (yangi avval)" },
                { value: "date_asc", label: "Sana (eski avval)" },
                { value: "amount_desc", label: "Summa (katta avval)" },
                { value: "amount_asc", label: "Summa (kichik avval)" },
              ]}
            />
          </div>

          {!isLoading && transactions.length === 0 && (
            <EmptyState icon="💳" title="Shu oyda hali tranzaksiya yo'q" />
          )}
          {!isLoading && transactions.length > 0 && visibleTransactions.length === 0 && (
            <EmptyState
              icon="🔍"
              title="Hech narsa topilmadi"
              hint="Qidiruv yoki filtrni o'zgartirib ko'ring."
            />
          )}

          <ul className="transaction-list">
            {visibleTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onDelete={() => handleDeleteTransaction(transaction.id)}
              />
            ))}
          </ul>
        </div>

        <div className="finance-side-column">
          <BudgetPanel
            budgets={budgets}
            expenseCategories={expenseCategories}
            year={year}
            month={month}
            onCreate={handleCreateBudget}
            onDelete={handleDeleteBudget}
          />

          <SavingsGoalPanel
            goals={savingsGoals}
            onCreate={handleCreateSavingsGoal}
            onUpdate={handleUpdateSavingsGoal}
            onDelete={handleDeleteSavingsGoal}
          />
        </div>
      </div>
    </div>
  );
}
