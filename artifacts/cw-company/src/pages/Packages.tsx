import { useListCompanyPackages } from "@workspace/api-client-react";
import { AppShell, AppHeader } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";

export default function Packages() {
  const { data, isLoading } = useListCompanyPackages();
  const items = (data as any[]) ?? [];

  return (
    <AppShell>
      <AppHeader title="Paquetes" subtitle="Planes que ofrece tu empresa" back="/profile" />
      <div className="p-4 space-y-2">
        {isLoading && <Skeleton className="h-40 w-full" />}
        {!isLoading && items.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Sin paquetes configurados.</p>
        )}
        {items.map((p) => (
          <Link key={p.package.id} href={`/packages/${p.package.id}`}>
            <Card
              className="p-4 flex items-center gap-3 cursor-pointer active:bg-muted/40 transition-colors"
              data-testid={`package-${p.package.slug}`}
            >
              <div
                className="w-2 h-12 rounded shrink-0"
                style={{ backgroundColor: p.color ?? "hsl(var(--primary))" }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold truncate">{p.name}</p>
                  {!p.active && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0">Inactivo</Badge>
                  )}
                </div>
                {p.description && (
                  <p className="text-xs text-muted-foreground italic mt-0.5 line-clamp-1">{p.description}</p>
                )}
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {p.visitsCount ?? 1} visita{(p.visitsCount ?? 1) === 1 ? "" : "s"} ·{" "}
                  {p.durationValue ?? 1} {p.durationUnit ?? "meses"}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
