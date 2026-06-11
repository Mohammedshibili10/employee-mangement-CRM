function ActionButton({ children, onClick, color = "green" }) {
  const colors = {
    green: "bg-brand-50 text-brand-700 hover:bg-brand-100 border-brand-200/70 hover:border-brand-300",
    red: "bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200/70 hover:border-rose-300",
    blue: "bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200/70 hover:border-sky-300",
    amber: "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200/70 hover:border-amber-300",
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-150 active:scale-95 ${colors[color]}`}
    >
      {children}
    </button>
  );
}

export default ActionButton;
