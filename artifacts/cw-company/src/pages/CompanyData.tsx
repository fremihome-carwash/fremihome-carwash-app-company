import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetCompanyProfile,
  useUpdateCompanyProfile,
  getGetCompanyProfileQueryKey,
} from "@workspace/api-client-react";
import { Camera, Trash2 } from "lucide-react";
import { AppShell, AppHeader } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { LogoCropperSheet } from "@/components/LogoCropperSheet";

function initialsFromName(name: string | null | undefined): string {
  if (!name) return "··";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "··";
}

export default function CompanyData() {
  const { data, isLoading, refetch } = useGetCompanyProfile();
  const queryClient = useQueryClient();
  const update = useUpdateCompanyProfile({
    mutation: {
      onSuccess: () => {
        toast.success("Datos actualizados");
        refetch();
      },
    },
  });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // ─── logo upload state ──────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (data) {
      setName((data as any).name ?? "");
      setPhone((data as any).phone ?? "");
    }
  }, [data]);

  const p = data as any;
  const logoUrl: string | null = p?.logoUrl ?? null;

  const onPickFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permitir re-elegir el mismo archivo
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadCroppedLogo = async (blob: Blob) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", blob, "logo.jpg");
      const token = window.localStorage.getItem("cw_token");
      const res = await fetch("/api/company/profile/logo", {
        method: "POST",
        body: form,
        headers: token ? { token } : undefined,
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({ error: "Error al subir" }));
        throw new Error(msg.error ?? "Error al subir");
      }
      await queryClient.invalidateQueries({ queryKey: getGetCompanyProfileQueryKey() });
      toast.success("Logo actualizado");
      setCropSrc(null);
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudo subir el logo");
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = async () => {
    setUploading(true);
    try {
      const token = window.localStorage.getItem("cw_token");
      const res = await fetch("/api/company/profile/logo", {
        method: "DELETE",
        headers: token ? { token } : undefined,
      });
      if (!res.ok) throw new Error("Error al quitar");
      await queryClient.invalidateQueries({ queryKey: getGetCompanyProfileQueryKey() });
      toast.success("Logo eliminado");
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudo eliminar");
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppShell>
      <AppHeader
        title="Datos del negocio"
        subtitle="Información de tu empresa"
        back="/profile"
      />
      <div className="p-4 space-y-4">
        {isLoading && <Skeleton className="h-64 w-full" />}
        {p && (
          <>
            <Card className="p-4 flex flex-col items-center gap-3">
              <Avatar className="h-28 w-28 ring-2 ring-border">
                {logoUrl && (
                  <AvatarImage
                    src={logoUrl}
                    alt={p.name ?? "Logo"}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="text-2xl font-semibold">
                  {initialsFromName(p.name)}
                </AvatarFallback>
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={onPickFile}
                data-testid="input-logo-file"
              />
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  data-testid="button-change-logo"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {logoUrl ? "Cambiar foto" : "Subir foto"}
                </Button>
                {logoUrl && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={removeLogo}
                    disabled={uploading}
                    aria-label="Eliminar logo"
                    data-testid="button-remove-logo"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </Card>

            <Card className="p-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email">Correo</Label>
                <Input id="email" value={p.email ?? ""} disabled />
                <p className="text-[11px] text-muted-foreground">
                  El correo no se puede modificar
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="name">Nombre del negocio</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  data-testid="input-name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  data-testid="input-phone"
                />
              </div>
              <Button
                className="w-full"
                onClick={() => update.mutate({ data: { name, phone } })}
                disabled={
                  update.isPending ||
                  (name === (p.name ?? "") && phone === (p.phone ?? ""))
                }
                data-testid="button-save-profile"
              >
                Guardar cambios
              </Button>
            </Card>
          </>
        )}
      </div>

      <LogoCropperSheet
        imageSrc={cropSrc}
        open={cropSrc !== null}
        onClose={() => !uploading && setCropSrc(null)}
        onConfirm={uploadCroppedLogo}
        submitting={uploading}
      />
    </AppShell>
  );
}
