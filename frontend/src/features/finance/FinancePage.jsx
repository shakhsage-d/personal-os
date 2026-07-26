import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../shared/auth/AuthContext";
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
    await financeApi.categories.create(payload);
    await loadAll();
  }

  async function handleDeleteCategory(categoryId) {
    await financeApi.categories.remove(categoryId);
    await loadAll();
  }

  async function handleCreateTransaction(payload) {
    await financeApi.transactions.create(payload);
    await loadAll();
  }

  async function handleDeleteTransaction(transactionId) {
    await financeApi.transactions.remove(transactionId);
    await loadAll();
  }

  async function handleCreateBudget(payload) {
    await financeApi.budgets.create(payload);
    await loadAll();
  }

  async function handleDeleteBudget(budgetId) {
    await financeApi.budgets.remove(budgetId);
    await loadAll();
  }

  async function handleCreateSavingsGoal(payload) {
    await financeApi.savingsGoals.create(payload);
    await loadAll();
  }

  async function handleUpdateSavingsGoal(goalId, payload) {
    await financeApi.savingsGoals.update(goalId, payload);
    await loadAll();
  }

  async function handleDeleteSavingsGoal(goalId) {
    await financeApi.savingsGoals.remove(goalId);
    await loadAll();
  }

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
          <button type="button" onClick={() => shiftMonth(-1)}>
            &larr;
          </button>
          <span className="finance-month-title">
            {year}-{String(month).padStart(2, "0")}
          </span>
          <button type="button" onClick={() => shiftMonth(1)}>
            &rarr;
          </button>
        </div>
        <button type="button" onClick={() => setShowCategoryManager((v) => !v)}>
          {showCategoryManager ? "Kategoriyalarni yashirish" : "Kategoriyalarni boshqarish"}
        </button>
      </div>

      {error && <p className="auth-error">{error}</p>}
      {isLoading && <p className="muted">Yuklanmoqda...</p>}

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

          {!isLoading && transactions.length === 0 && (
            <p className="muted">Shu oyda hali tranzaksiya yo'q.</p>
          )}

          <ul className="transaction-list">
            {transactions.map((transaction) => (
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
