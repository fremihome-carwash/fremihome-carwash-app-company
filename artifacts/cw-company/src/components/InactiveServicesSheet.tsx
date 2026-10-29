import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

export type InactiveServiceItem = {
  id: string;
  name: string;
  description?: string | null;
  price?: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentName: string;
  services: InactiveServiceItem[];
  submitting?: boolean;
  /** Llamado con los IDs marcados para activar. Vacío = sólo activar el padre. */
  onConfirm: (selectedIds: string[]) => void;
};

export function InactiveServicesSheet({
  open,
  onOpenChange,
  parentName,
  services,
  submitting,
  onConfirm,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) setSelected(new Set(services.map((s) => s.id)));
  }, [open, services]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl p-0 h-[80vh] flex flex-col"
      >
        <SheetHeader className="px-4 pt-4 pb-2 text-left">
          <SheetTitle>Activar {parentName}</SheetTitle>
          <SheetDescription>
            Algunos servicios incluidos no están activos para tu empresa. Puedes
            activarlos ahora o más tarde — el paquete se activará igual.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
          {services.map((s) => {
            const checked = selected.has(s.id);
            return (
              <Card
                key={s.id}
                className="p-3 flex items-start gap-3 cursor-pointer"
                onClick={() => toggle(s.id)}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggle(s.id)}
                  className="mt-0.5"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{s.name}</p>
                  {s.description && (
                    <p className="text-xs text-muted-foreground italic mt-0.5 line-clamp-2">
                      {s.description}
                    </p>
                  )}
                  {typeof s.price === "number" && s.price > 0 && (
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      base {formatCurrency(s.price)}
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="sticky bottom-0 bg-background border-t p-3 flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1"
            onClick={() => onConfirm(Array.from(selected))}
            disabled={submitting}
          >
            Activar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
