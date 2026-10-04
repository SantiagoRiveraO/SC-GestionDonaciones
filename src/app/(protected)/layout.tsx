import { AppHeader } from "@/components/app-header";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppHeader />
      <div className="flex flex-1 flex-col">{children}</div>
    </>
  );
}
