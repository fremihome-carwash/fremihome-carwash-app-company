import { useListCompanyServices } from "@workspace/api-client-react";
import { AppShell, AppHeader } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/format";

export default function Services() {
  const { data, isLoading } = useListCompanyServices();
  const items = (data as any[]) ?? [];

  return (
    <AppShell>
      <AppHeader title="Servicios" subtitle="Servicios que ofreces" back="/profile" />
      <div className="p-4 space-y-2">
        {isLoading && <Skeleton className="h-40 w-full" />}
        {!isLoading && items.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Sin servicios disponibles. La plataforma aún no ha creado ninguno.
          </p>
        )}
        {items.map((s) => (
          <ServiceRow key={s.service.id} item={s} />
        ))}
      </div>
    </AppShell>
  );
}

function ServiceRow({ item }: { item: any }) {
  return (
    <Link href={`/services/${item.service.id}`}>
      <Card
        className="p-3 flex items-center gap-3 cursor-pointer active:bg-muted/40 transition-colors"
        data-testid={`service-${item.service.slug}`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium truncate">{item.name}</p>
            {!item.active && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0">Inactivo</Badge>
            )}
          </div>
          {item.description && (
            <p className="text-xs text-muted-foreground italic mt-0.5 line-clamp-1">{item.description}</p>
          )}
          <p className="text-xs text-muted-foreground mt-0.5">
            base {formatCurrency(item.price)}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </Card>
    </Link>
  );
}
