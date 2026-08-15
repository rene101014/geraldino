"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateLeadStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_submissions")
    .update({ status })
    .eq("id", id);
  if (error) {
    throw new Error(`No se pudo actualizar el estado del mensaje: ${error.message}`);
  }
  revalidatePath("/admin/leads");
}
