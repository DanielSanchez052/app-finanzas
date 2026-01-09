export function getMonth(date) {
  return date.slice(0, 7);
}

export function formatMoney(value) {
  return value.toLocaleString("es-CO");
}

export function generateId() {
  return crypto.randomUUID();
}