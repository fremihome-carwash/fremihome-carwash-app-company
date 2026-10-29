export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

const monthsShort = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const daysShort = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function parseDate(yyyyMmDd: string): Date {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateShort(yyyyMmDd: string): string {
  const d = parseDate(yyyyMmDd);
  return `${d.getDate()} ${monthsShort[d.getMonth()]}`;
}

export function formatDateLong(yyyyMmDd: string): string {
  const d = parseDate(yyyyMmDd);
  return `${daysShort[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function toLocalIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function todayIso(): string {
  return toLocalIso(new Date());
}

export function addDaysIso(iso: string, days: number): string {
  const d = parseDate(iso);
  d.setDate(d.getDate() + days);
  return toLocalIso(d);
}

// "13:30" → "1:30 PM", "00:00" → "12:00 AM", "24:00" → "12:00 AM" (medianoche siguiente)
export function formatTime12h(hhmm: string): string {
  if (!hhmm) return "";
  if (hhmm === "24:00") return "12:00 AM";
  const [hStr, mStr] = hhmm.split(":");
  let h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const suffix = h < 12 ? "AM" : "PM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, "0")} ${suffix}`;
}
