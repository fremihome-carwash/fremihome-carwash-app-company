import { useMemo, useState } from "react";
import {
  useListCompanyWashTypes,
  useUpdateCompanyWashTypes,
  useUpdateCompanyServices,
} from "@workspace/api-client-react";
import { AppShell, AppHeader } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Clock, Tag } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";
import { InactiveServicesSheet } from "@/components/InactiveServicesSheet";

export default function WashTypeDetail({ id }: { id: string }) {
  const { data, isLoading, refetch } = useListCompanyWashTypes();
  const items = (data as any[]) ?? [];
  const wt = useMemo(() => items.find((w) => w.washType.id === id), [items, id]);

  const update = useUpdateCompanyWashTypes({
    mutation: {
      onSuccess: () => { toast.success("Actualizado"); refetch(); },
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
    () => ((wt?.services as any[]) ?? []).filter((s) => !s.active),
    [wt],
  );

  const handleToggle = (active: boolean) => {
    if (active && inactiveServices.length > 0) {
      setSheetOpen(true);
      return;
    }
    update.mutate({ data: { washTypes: [{ washTypeId: id, active }] } });
  };

  const handleConfirmActivate = async (selectedIds: string[]) => {
    if (selectedIds.length > 0) {
      await updateServices.mutateAsync({
        data: {
          services: selectedIds.map((serviceId) => ({ serviceId, active: true })),
        },
      });
    }
    update.mutate({ data: { washTypes: [{ washTypeId: id, active: true }] } });
    setSheetOpen(false);
  };

  if (isLoading) {
    return (
      <AppShell>
        <AppHeader title="Tipo de lavado" back="/wash-types" />
        <div className="p-4"><Skeleton className="h-60 w-full" /></div>
      </AppShell>
    );
  }

  if (!wt) {
    return (
      <AppShell>
        <AppHeader title="Tipo de lavado" back="/wash-types" />
        <div className="p-4 text-center text-sm text-muted-foreground">Tipo de lavado no encontrado.</div>
      </AppShell>
    );
  }

  // Compute total por tamaño = basePrice + Σ(service.price + sizeMod) - discount
  const sizeSlugs = wt.services.length > 0
    ? Object.keys(wt.services[0]?.sizeModifiers ?? {})
    : [];

  const totalsBySize = sizeSlugs.map((slug) => {
    const sumServices = wt.services.reduce(
      (sum: number, s: any) => sum + s.price + (s.sizeModifiers?.[slug] ?? 0),
      0,
    );
    const subtotal = (wt.basePrice ?? 0) + sumServices;
    const discount = Math.min(
      subtotal,
      subtotal * ((wt.discountPct ?? 0) / 100) + (wt.discountAmount ?? 0),
    );
    return { slug, total: Math.max(0, subtotal - discount) };
  });

  return (
    <AppShell>
      <AppHeader title={wt.name} back="/wash-types" />
      <div className="p-4 space-y-4">
        {/* Toggle */}
        <Card className="p-4 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <Label className="text-sm font-semibold">Activo para mi empresa</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              {wt.active
                ? "Los clientes pueden contratar este tipo de lavado contigo."
                : "Los clientes NO ven este tipo de lavado entre tus opciones."}
            </p>
          </div>
          <Switch
            checked={wt.active}
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
              style={{ backgroundColor: wt.color ?? "hsl(var(--primary))" }}
            />
            <div className="flex-1 min-w-0 space-y-1">
              <p className="font-bold text-lg leading-tight">{wt.name}</p>
              {wt.description && (
                <p className="text-sm text-muted-foreground">{wt.description}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Detalles */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="font-medium">
                Precio base: <span className="font-mono">{formatCurrency(wt.basePrice)}</span>
              </p>
              {(wt.discountPct > 0 || wt.discountAmount > 0) && (
                <p className="text-xs text-muted-foreground">
                  Descuento{" "}
                  {wt.discountPct > 0 && `${wt.discountPct}%`}
                  {wt.discountPct > 0 && wt.discountAmount > 0 && " + "}
                  {wt.discountAmount > 0 && formatCurrency(wt.discountAmount)}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Servicios incluidos */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Servicios incluidos
          </p>
          {wt.services.length === 0 ? (
            <Card className="p-4 text-sm text-muted-foreground text-center">
              Este tipo de lavado no tiene servicios configurados.
            </Card>
          ) : (
            <div className="space-y-2">
              {wt.services.map((s: any) => (
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
        parentName={wt.name}
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
