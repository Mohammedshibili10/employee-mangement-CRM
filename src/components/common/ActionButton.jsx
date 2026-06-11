// A small pill-style button used inside table rows.
// color can be: green, red, blue, amber
function ActionButton({ children, onClick, color = "green" }) {
  const colors = {
    green: "bg-green-50 text-green-700 hover:bg-green-100 border-green-200",
    red: "bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200",
    blue: "bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200",
    amber: "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200",
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-md border text-xs font-medium transition-colors ${colors[color]}`}
    >
      {children}
    </button>
  );
}

export default ActionButton;
