// Shimmering placeholder blocks shown while data is loading.
// `Skeleton` is the base building block; the named helpers below
// compose it into common page shapes (stat cards, tables, lists).

function Skeleton({ className = "" }) {
  return (
    <div className={`relative overflow-hidden rounded-md bg-slate-200/70 ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-shimmer animate-shimmer" />
    </div>
  );
}

// A row of stat-card placeholders (matches the dashboard summary cards).
export function SkeletonStatCards({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-slate-200/70 shadow-soft p-5"
        >
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-16 mt-3" />
        </div>
      ))}
    </div>
  );
}

// A card-shaped placeholder block.
export function SkeletonCard({ className = "" }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/70 shadow-soft p-5 ${className}`}
    >
      <Skeleton className="h-4 w-32 mb-4" />
      <div className="space-y-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>
    </div>
  );
}

// A full table placeholder that mirrors the real Table component's frame.
export function SkeletonTable({ rows = 6, cols = 5 }) {
  return (
    <div className="overflow-hidden bg-white rounded-2xl border border-slate-200/70 shadow-card">
      <div className="bg-slate-50/80 border-b border-slate-200/70 px-4 py-3.5 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-4 py-4 flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton
                key={c}
                className="h-3.5 flex-1"
                // Stagger widths a little so it reads like real data.
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Skeleton;
