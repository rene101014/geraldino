"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Trash2,
  ChevronRight,
  Building2,
  User,
  CornerDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteAccount } from "@/app/admin/(dashboard)/crm/actions";
import {
  ACCOUNT_STATUS_LABELS,
  type CrmAccount,
  type CrmAccountWithChildren,
} from "@/lib/data/crm";

export function CrmAccountsList({
  accounts,
}: {
  accounts: CrmAccountWithChildren[];
}) {
  if (accounts.length === 0) {
    return (
      <p className="mt-10 text-sm text-muted-foreground">
        Todavía no tienes clientes. Usa &quot;Nuevo cliente&quot; o &quot;Nueva
        agencia&quot; para empezar.
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-3">
      {accounts.map((account) => (
        <div
          key={account.id}
          className="rounded-xl border border-border bg-card"
        >
          <AccountRow account={account} isAgency={account.type === "agencia"} />

          {account.children.length > 0 && (
            <div className="border-t border-border/60 pl-6">
              {account.children.map((child) => (
                <AccountRow key={child.id} account={child} nested />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function AccountRow({
  account,
  isAgency = false,
  nested = false,
}: {
  account: CrmAccount;
  isAgency?: boolean;
  nested?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  const Icon = nested ? CornerDownRight : isAgency ? Building2 : User;

  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <Link
        href={`/admin/crm/${account.id}`}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{account.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {account.contact_name || account.email || "Sin contacto"}
          </p>
        </div>
      </Link>

      <div className="flex shrink-0 items-center gap-2">
        {isAgency && <Badge variant="secondary">Agencia</Badge>}
        <Badge variant="outline" className="hidden sm:inline-flex">
          {ACCOUNT_STATUS_LABELS[account.status] ?? account.status}
        </Badge>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" title="Eliminar">
              <Trash2 className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                ¿Eliminar &quot;{account.name}&quot;?
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isAgency
                  ? "Se borra la agencia y todos sus sub-clientes y trabajos. Las galerías enlazadas se conservan (quedan sin trabajo). No se puede deshacer."
                  : "Se borra el cliente y sus trabajos. Las galerías enlazadas se conservan. No se puede deshacer."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                disabled={pending}
                onClick={() => {
                  startTransition(() => deleteAccount(account.id));
                  toast.success("Cliente eliminado");
                }}
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Link href={`/admin/crm/${account.id}`}>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}
