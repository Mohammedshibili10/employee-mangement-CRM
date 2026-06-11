// A premium dual-ring spinner. Used for full-section loading states.
// `size` controls the diameter; `label` shows optional text underneath.

function Loader({ size = "md", label }) {
  const sizes = {
    sm: "h-6 w-6 border-2",
    md: "h-10 w-10 border-[3px]",
    lg: "h-14 w-14 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div className="relative">
        {/* Faint full ring */}
        <div className={`${sizes[size]} rounded-full border-slate-200`}></div>
        {/* Spinning brand arc on top */}
        <div
          className={`${sizes[size]} rounded-full border-brand-500 border-t-transparent border-r-transparent animate-spin-slow absolute inset-0`}
        ></div>
      </div>
      {label && (
        <p className="text-sm text-slate-400 animate-pulse">{label}</p>
      )}
    </div>
  );
}

export default Loader;
