import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export function displayNameFrom(
  fullName: string | null | undefined,
  email?: string,
) {
  const name = fullName?.trim();
  if (name) {
    return name;
  }

  const fromEmail = email?.split("@")[0]?.trim();
  return fromEmail || "usuario";
}

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export const getDisplayName = cache(async () => {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  return displayNameFrom(profile?.full_name, user.email);
});
