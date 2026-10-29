import { useMemo, useState } from "react";
import {
  useListCompanyPackages,
  useUpdateCompanyPackages,
  useUpdateCompanyServices,
} from "@workspace/api-client-react";
import { AppShell, AppHeader } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Tag } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";
import { InactiveServicesSheet } from "@/components/InactiveServicesSheet";

const UNIT_LABEL: Record<string, string> = { days: "días", weeks: "semanas", months: "meses" };

export default function PackageDetail({ id }: { id: string }) {
  const { data, isLoading, refetch } = useListCompanyPackages();
  const items = (data as any[]) ?? [];
  const pkg = useMemo(() => items.find((p) => p.package.id === id), [items, id]);

  const update = useUpdateCompanyPackages({
    mutation: {
      onSuccess: () => {
        toast.success("Actualizado");
        refetch();
      },
      onError: () => toast.error("No se pudo actualizar"),
    },
  });

  const updateServices = useUpdateCompanyServices({
    mutation: {
      onError: () => toast.error("No se pudieron activar los servicios"),
    },
  });

  const [sheetOpen, setSheetOpen] = useState(false);

  const inactiveServices = useMemo(
    () => ((pkg?.services as any[]) ?? []).filter((s) => !s.active),
    [pkg],
  );

  const handleToggle = (active: boolean) => {
    if (active && inactiveServices.length > 0) {
      setSheetOpen(true);
      return;
    }
    update.mutate({ data: { packages: [{ packageId: id, active }] } });
  };

  const handleConfirmActivate = async (selectedIds: string[]) => {
    if (selectedIds.length > 0) {
      await updateServices.mutateAsync({
        data: {
          services: selectedIds.map((serviceId) => ({ serviceId, active: true })),
        },
      });
    }
    update.mutate({ data: { packages: [{ packageId: id, active: true }] } });
    setSheetOpen(false);
  };

  if (isLoading) {
    return (
      <AppShell>
        <AppHeader title="Paquete" back="/packages" />
        <div className="p-4"><Skeleton className="h-60 w-full" /></div>
      </AppShell>
    );
  }

  if (!pkg) {
    return (
      <AppShell>
        <AppHeader title="Paquete" back="/packages" />
        <div className="p-4 text-center text-sm text-muted-foreground">Paquete no encontrado.</div>
      </AppShell>
    );
  }

  const sizeSlugs = pkg.services.length > 0
    ? Object.keys(pkg.services[0]?.sizeModifiers ?? {})
    : [];

  const totalsBySize = sizeSlugs.map((slug) => {
    const perVisit = pkg.services.reduce(
      (sum: number, s: any) => sum + s.price + (s.sizeModifiers?.[slug] ?? 0),
      0,
    );
    const subtotal = (pkg.basePrice ?? 0) + perVisit * (pkg.visitsCount ?? 1);
    const discount = Math.min(
      subtotal,
      subtotal * ((pkg.discountPct ?? 0) / 100) + (pkg.discountAmount ?? 0),
    );
    return { slug, total: Math.max(0, subtotal - discount) };
  });

  return (
    <AppShell>
      <AppHeader title={pkg.name} back="/packages" />
      <div className="p-4 space-y-4">
        {/* Activar / desactivar */}
        <Card className="p-4 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <Label className="text-sm font-semibold">Activo para mi empresa</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              {pkg.active
                ? "Los clientes pueden contratar este paquete contigo."
                : "Los clientes NO ven este paquete entre tus opciones."}
            </p>
          </div>
          <Switch
            checked={pkg.active}
            onCheckedChange={handleToggle}
            disabled={update.isPending}
            data-testid="switch-active"
          />
        </Card>

        {/* Header con color */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div
              className="w-3 h-14 rounded shrink-0"
              style={{ backgroundColor: pkg.color ?? "hsl(var(--primary))" }}
            />
            <div className="flex-1 min-w-0 space-y-1">
              <p className="font-bold text-lg leading-tight">{pkg.name}</p>
              {pkg.description && (
                <p className="text-sm text-muted-foreground">{pkg.description}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Detalles */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="font-medium">
                {pkg.visitsCount} visita{pkg.visitsCount === 1 ? "" : "s"} en{" "}
                {pkg.durationValue} {UNIT_LABEL[pkg.durationUnit] ?? pkg.durationUnit}
              </p>
              <p className="text-xs text-muted-foreground">Vigencia y frecuencia</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="font-medium">
                Precio base: <span className="font-mono">{formatCurrency(pkg.basePrice)}</span>
              </p>
              {(pkg.discountPct > 0 || pkg.discountAmount > 0) && (
                <p className="text-xs text-muted-foreground">
                  Descuento{" "}
                  {pkg.discountPct > 0 && `${pkg.discountPct}%`}
                  {pkg.discountPct > 0 && pkg.discountAmount > 0 && " + "}
                  {pkg.discountAmount > 0 && formatCurrency(pkg.discountAmount)}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Servicios incluidos */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Cada visita incluye
          </p>
          {pkg.services.length === 0 ? (
            <Card className="p-4 text-sm text-muted-foreground text-center">
              Este paquete no tiene servicios configurados.
            </Card>
          ) : (
            <div className="space-y-2">
              {pkg.services.map((s: any) => (
                <Card key={s.id} className="p-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{s.name}</p>
                      {!s.active && (
                        <Badge variant="outline" className="text-[10px] shrink-0 border-amber-500 text-amber-600">
                          Inactivo
                        </Badge>
                      )}
                    </div>
                    {s.description && (
                      <p className="text-xs text-muted-foreground italic mt-0.5 line-clamp-2">{s.description}</p>
                    )}
                    {(s.minMinutes > 0 || s.maxMinutes > 0) && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {s.minMinutes}–{s.maxMinutes} min
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-mono shrink-0">
                    base {formatCurrency(s.price)}
                  </Badge>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Precios finales por tamaño */}
        {totalsBySize.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Precio final por tamaño
            </p>
            <Card className="p-3 space-y-1.5">
              {totalsBySize.map((t) => (
                <div key={t.slug} className="flex items-center justify-between text-sm">
                  <span className="uppercase text-muted-foreground text-xs font-mono">{t.slug}</span>
                  <span className="font-semibold">{formatCurrency(t.total)}</span>
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>

      <InactiveServicesSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        parentName={pkg.name}
        services={inactiveServices.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          price: s.price,
        }))}
        submitting={update.isPending || updateServices.isPending}
        onConfirm={handleConfirmActivate}
      />
    </AppShell>
  );
}
