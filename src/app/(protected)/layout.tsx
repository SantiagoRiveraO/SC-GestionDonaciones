import { AppHeader } from "@/components/app-header";
import { requireUser } from "@/lib/supabase/auth";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();

  return (
    <>
      <AppHeader />
      <div className="flex flex-1 flex-col">{children}</div>
    </>
  );
}
