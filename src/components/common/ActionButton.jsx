// Shared SVG icon-only action button used across all admin tables.
// Supports "edit" (pencil), "delete" (trash), "view" (eye) icon types.

const ICONS = {
  edit: (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  delete: (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" /><path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  ),
  view: (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
};

const COLORS = {
  green: "text-brand-700 bg-brand-50 hover:bg-brand-100 border-brand-200/70",
  red:   "text-rose-700  bg-rose-50  hover:bg-rose-100  border-rose-200/70",
  blue:  "text-sky-700   bg-sky-50   hover:bg-sky-100   border-sky-200/70",
  amber: "text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200/70",
};

function ActionButton({ children, onClick, color = "green", icon, title }) {
  const iconEl = icon ? ICONS[icon] : null;

  return (
    <button
      onClick={onClick}
      title={title || (typeof children === "string" ? children : undefined)}
      className={`inline-flex items-center justify-center rounded-lg border transition-all duration-150 active:scale-95 ${
        iconEl && !children
          ? "p-1.5"                         // icon-only: compact square
          : "px-3 py-1.5 gap-1.5 text-xs font-semibold"  // text (+ optional icon)
      } ${COLORS[color] || COLORS.green}`}
    >
      {iconEl}
      {children}
    </button>
  );
}

export default ActionButton;
