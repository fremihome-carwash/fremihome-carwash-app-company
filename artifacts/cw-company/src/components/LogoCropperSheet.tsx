import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

type Props = {
  /** Data URL de la imagen original cargada por el usuario. */
  imageSrc: string | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (blob: Blob) => Promise<void> | void;
  submitting?: boolean;
};

// Tamaño del lado del output final (cuadrado). Suficiente para mostrar el
// avatar grande en cualquier pantalla de mobile sin pesar de más.
const OUTPUT_SIZE = 512;

export function LogoCropperSheet({
  imageSrc,
  open,
  onClose,
  onConfirm,
  submitting = false,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPx, setCroppedAreaPx] = useState<Area | null>(null);

  useEffect(() => {
    if (open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPx(null);
    }
  }, [open, imageSrc]);

  const onCropComplete = useCallback((_area: Area, areaPx: Area) => {
    setCroppedAreaPx(areaPx);
  }, []);

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPx) return;
    const blob = await cropToBlob(imageSrc, croppedAreaPx);
    if (blob) await onConfirm(blob);
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl p-0 h-[80vh] overflow-hidden flex flex-col"
      >
        <SheetHeader className="px-4 pt-4 pb-2 text-left">
          <SheetTitle>Ajustar logo</SheetTitle>
          <SheetDescription>
            Centrá y ajustá el zoom. El recorte es cuadrado.
          </SheetDescription>
        </SheetHeader>

        <div className="relative flex-1 bg-muted">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </div>

        <div className="px-4 py-3 border-t space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-10">Zoom</span>
            <Slider
              min={1}
              max={4}
              step={0.05}
              value={[zoom]}
              onValueChange={(v) => setZoom(v[0] ?? 1)}
              className="flex-1"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-background border-t p-3 flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1"
            onClick={handleConfirm}
            disabled={submitting || !croppedAreaPx}
            data-testid="button-confirm-logo-crop"
          >
            {submitting ? "Subiendo..." : "Guardar"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

async function cropToBlob(src: string, area: Area): Promise<Blob | null> {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(
    img,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE,
  );
  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9),
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
