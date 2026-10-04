import { Card } from "@/components/ui/card";

export default function DonationsLoading() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-brand-soft" />
        <div className="h-5 w-72 animate-pulse rounded-lg bg-zinc-200" />
      </div>
      <Card className="h-28 animate-pulse border-0 bg-surface" />
      <Card className="h-28 animate-pulse border-0 bg-brand-soft" />
      <Card className="h-[72px] animate-pulse border-0 bg-surface" />
      <Card className="h-[72px] animate-pulse border-0 bg-surface" />
      <Card className="h-[72px] animate-pulse border-0 bg-surface" />
    </main>
  );
}
