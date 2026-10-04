import { AppHeader } from "@/components/app-header";
import { getDisplayName } from "@/lib/supabase/auth";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const displayName = await getDisplayName();

  return (
    <>
      <AppHeader displayName={displayName} />
      <div className="flex flex-1 flex-col pb-[calc(64px+1rem+env(safe-area-inset-bottom))] xl:pb-0">
        {children}
      </div>
    </>
  );
}
