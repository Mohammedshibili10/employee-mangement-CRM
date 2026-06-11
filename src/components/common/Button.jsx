// Primary button. Supports a `loading` state that shows an inline spinner
// and disables the button so users get clear feedback during async actions.

function Button({
  children,
  onClick,
  type = "button",
  color = "blue",
  loading = false,
  disabled = false,
  className = "",
}) {
  const colors = {
    // "blue" and "green" both map to the brand gradient (kept for API compatibility)
    blue: "bg-brand-gradient text-white shadow-glow-sm hover:shadow-glow hover:brightness-105 focus:ring-brand-500/40",
    green: "bg-brand-gradient text-white shadow-glow-sm hover:shadow-glow hover:brightness-105 focus:ring-brand-500/40",
    red: "bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-glow-sm hover:brightness-105 focus:ring-rose-500/40",
    gray: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-soft focus:ring-slate-300/60",
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 active:scale-[0.97] disabled:opacity-60 disabled:active:scale-100 disabled:cursor-not-allowed ${colors[color]} ${className}`}
    >
      {loading && (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      )}
      {children}
    </button>
  );
}

export default Button;
