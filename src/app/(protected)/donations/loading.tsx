export default function DonationsLoading() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="space-y-3">
        <div className="h-8 w-48 animate-pulse rounded-md bg-zinc-200" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-zinc-100" />
      </div>
      <div className="h-40 animate-pulse rounded-lg border border-zinc-200 bg-zinc-50" />
      <div className="h-56 animate-pulse rounded-lg border border-zinc-200 bg-zinc-50" />
    </main>
  );
}
