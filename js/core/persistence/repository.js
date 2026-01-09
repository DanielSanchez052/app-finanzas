import { openDB, getStore } from "./db.js";

export async function initRepository() {
  await openDB();
}

export function clearDatabase() {
  return Promise.all([
    clearStore("incomes"),
    clearStore("expenses"),
    clearStore("budgets")
  ]);
}

function clearStore(storeName) {
  return new Promise(resolve => {
    const req = getStore(storeName, "readwrite").clear();
    req.onsuccess = () => resolve();
  });
}

/* ========= INGRESOS ========= */

export function getIncomes() {
  return new Promise(resolve => {
    const req = getStore("incomes").getAll();
    req.onsuccess = () => resolve(req.result);
  });
}

export function addIncome(income) {
  return new Promise(resolve => {
    getStore("incomes", "readwrite").put(income).onsuccess = resolve;
  });
}

/* ========= GASTOS ========= */

export function getExpenses() {
  return new Promise(resolve => {
    const req = getStore("expenses").getAll();
    req.onsuccess = () => resolve(req.result);
  });
}

export function addExpense(expense) {
  return new Promise(resolve => {
    getStore("expenses", "readwrite").put(expense).onsuccess = resolve;
  });
}

/* ========= PRESUPUESTOS ========= */

export function getBudgets() {
  return new Promise(resolve => {
    const req = getStore("budgets").getAll();
    req.onsuccess = () => resolve(req.result);
  });
}

export function saveBudget(budget) {
  return new Promise(resolve => {
    getStore("budgets", "readwrite").put(budget).onsuccess = resolve;
  });
}
