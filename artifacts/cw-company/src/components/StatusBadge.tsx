import { Badge } from "@/components/ui/badge";

const labels: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pendiente", cls: "bg-amber-100 text-amber-900 border-amber-200" },
  accepted: { label: "Aceptada", cls: "bg-blue-100 text-blue-900 border-blue-200" },
  por_iniciar: { label: "Por iniciar", cls: "bg-orange-100 text-orange-900 border-orange-200" },
  in_progress: { label: "En curso", cls: "bg-violet-100 text-violet-900 border-violet-200" },
  completed: { label: "Completada", cls: "bg-emerald-100 text-emerald-900 border-emerald-200" },
  cancelled: { label: "Cancelada", cls: "bg-rose-100 text-rose-900 border-rose-200" },
};

const companyLabels: Record<string, { label: string; cls: string }> = {
  pending_acceptance: { label: "Por aceptar", cls: "bg-amber-100 text-amber-900 border-amber-200" },
  accepted_by_company: { label: "Aceptada", cls: "bg-emerald-100 text-emerald-900 border-emerald-200" },
  rejected_by_company: { label: "Rechazada", cls: "bg-rose-100 text-rose-900 border-rose-200" },
};

const PRE_START_WINDOW_MS = 60 * 60 * 1000;

function isWithinStartWindow(date?: string, time?: string): boolean {
  if (!date || !time) return false;
  const [y, m, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  if (!y || !m || !d || Number.isNaN(h) || Number.isNaN(mi)) return false;
  const bookingDt = new Date(y, m - 1, d, h, mi);
  return bookingDt.getTime() - Date.now() <= PRE_START_WINDOW_MS;
}

export function StatusBadge({
  status,
  date,
  time,
}: {
  status: string;
  date?: string;
  time?: string;
}) {
  const effective =
    status === "accepted" && isWithinStartWindow(date, time) ? "por_iniciar" : status;
  const v = labels[effective] ?? { label: effective, cls: "bg-muted text-muted-foreground" };
  return (
    <Badge variant="outline" className={v.cls} data-testid={`status-${effective}`}>
      {v.label}
    </Badge>
  );
}

export function CompanyStatusBadge({ status }: { status: string }) {
  const v = companyLabels[status];
  if (!v) return null;
  return (
    <Badge variant="outline" className={v.cls} data-testid={`company-status-${status}`}>
      {v.label}
    </Badge>
  );
}

export function PaymentBadge({ type, status }: { type: string; status?: string }) {
  const isPaid = status === "pagado";
  return (
    <div className="flex items-center gap-1.5">
      <Badge variant="outline" className="bg-slate-100 text-slate-900 border-slate-200">
        {type === "directo" ? "Directo" : "Membresía"}
      </Badge>
      {status && (
        <Badge
          variant="outline"
          className={isPaid ? "bg-emerald-100 text-emerald-900 border-emerald-200" : "bg-amber-100 text-amber-900 border-amber-200"}
        >
          {isPaid ? "Pagado" : "Pendiente"}
        </Badge>
      )}
    </div>
  );
}
