import { AppHeader } from "@/components/app-header";
import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

function displayNameFrom(fullName: string | null | undefined, email?: string) {
  const name = fullName?.trim();
  if (name) {
    return name;
  }

  const fromEmail = email?.split("@")[0]?.trim();
  return fromEmail || "usuario";
}

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <>
      <AppHeader displayName={displayNameFrom(profile?.full_name, user.email)} />
      <div className="flex flex-1 flex-col pb-[calc(64px+1rem+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </div>
    </>
  );
}
