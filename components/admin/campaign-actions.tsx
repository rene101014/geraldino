"use client";

import {
  sendCampaign,
  deleteCampaign,
} from "@/app/admin/(dashboard)/campanas/actions";
import { Button } from "@/components/ui/button";

export function SendButton({ id, disabled }: { id: string; disabled?: boolean }) {
  return (
    <form
      action={sendCampaign}
      onSubmit={(e) => {
        if (
          !confirm(
            "¿Enviar esta campaña a todos los destinatarios? Esto no se puede deshacer.",
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" disabled={disabled}>
        Enviar ahora
      </Button>
    </form>
  );
}

export function DeleteButton({ id }: { id: string }) {
  return (
    <form
      action={deleteCampaign}
      onSubmit={(e) => {
        if (!confirm("¿Borrar esta campaña y todos sus datos de envío?")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="ghost" size="sm" className="text-destructive">
        Borrar campaña
      </Button>
    </form>
  );
}
