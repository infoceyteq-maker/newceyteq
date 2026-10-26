export default function AdminLoading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-live="polite">
      <div className="neu-raised h-[132px] animate-pulse rounded-neu-lg" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="neu h-[122px] animate-pulse rounded-neu" />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <div className="neu-raised h-[300px] animate-pulse rounded-neu-lg" />
        <div className="neu-raised h-[300px] animate-pulse rounded-neu-lg" />
      </div>
      <span className="sr-only">Loading dashboard…</span>
    </div>
  );
}
