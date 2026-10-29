import { useMemo } from "react";
import {
  useListCompanyServices,
  useUpdateCompanyServices,
} from "@workspace/api-client-react";
import { AppShell, AppHeader } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Clock, Tag } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";

export default function ServiceDetail({ id }: { id: string }) {
  const { data, isLoading, refetch } = useListCompanyServices();
  const items = (data as any[]) ?? [];
  const item = useMemo(() => items.find((s) => s.service.id === id), [items, id]);

  const update = useUpdateCompanyServices({
    mutation: {
      onSuccess: () => {
        toast.success("Actualizado");
        refetch();
      },
      onError: () => toast.error("No se pudo actualizar"),
    },
  });

  const handleToggle = (active: boolean) => {
    update.mutate({ data: { services: [{ serviceId: id, active }] } });
  };

  if (isLoading) {
    return (
      <AppShell>
        <AppHeader title="Servicio" back="/services" />
        <div className="p-4"><Skeleton className="h-60 w-full" /></div>
      </AppShell>
    );
  }

  if (!item) {
    return (
      <AppShell>
        <AppHeader title="Servicio" back="/services" />
        <div className="p-4 text-center text-sm text-muted-foreground">Servicio no encontrado.</div>
      </AppShell>
    );
  }

  const sizeModifiers = (item.sizeModifiers ?? {}) as Record<string, number>;
  const sizeEntries = Object.entries(sizeModifiers);

  return (
    <AppShell>
      <AppHeader title={item.name} back="/services" />
      <div className="p-4 space-y-4">
        {/* Toggle */}
        <Card className="p-4 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <Label className="text-sm font-semibold">Activo para mi empresa</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              {item.active
                ? "Los clientes pueden contratar este servicio contigo."
                : "Los clientes NO ven este servicio entre tus opciones."}
            </p>
          </div>
          <Switch
            checked={item.active}
            onCheckedChange={handleToggle}
            disabled={update.isPending}
            data-testid="switch-active"
          />
        </Card>

        {/* Descripción */}
        {item.description && (
          <Card className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Descripción</p>
            <p className="text-sm">{item.description}</p>
          </Card>
        )}

        {/* Detalles */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="font-medium">
                Precio base: <span className="font-mono">{formatCurrency(item.price)}</span>
              </p>
              <p className="text-xs text-muted-foreground">Servicio</p>
            </div>
          </div>

          {(item.minMinutes > 0 || item.maxMinutes > 0) && (
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium">{item.minMinutes}–{item.maxMinutes} min</p>
                <p className="text-xs text-muted-foreground">Duración estimada</p>
              </div>
            </div>
          )}
        </Card>

        {/* Precio por tamaño */}
        {sizeEntries.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Precio final por tamaño
            </p>
            <Card className="p-3 space-y-1.5">
              {sizeEntries.map(([slug, modifier]) => (
                <div key={slug} className="flex items-center justify-between text-sm">
                  <span className="uppercase text-muted-foreground text-xs font-mono">{slug}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    base + {formatCurrency(modifier)}
                  </span>
                  <span className="font-semibold">{formatCurrency(item.price + modifier)}</span>
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
