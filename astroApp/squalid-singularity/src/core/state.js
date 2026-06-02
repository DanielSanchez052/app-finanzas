export const state = {
  currentMonth: new Date().toISOString().slice(0, 7),
  incomes: [],
  expenses: [],
  budgets: {}
};
