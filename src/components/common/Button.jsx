function Button({ children, onClick, type = "button", color = "blue" }) {
  const colors = {
    blue: "bg-green-600 hover:bg-green-700 text-white",
    green: "bg-green-600 hover:bg-green-700 text-white",
    red: "bg-rose-600 hover:bg-rose-700 text-white",
    gray: "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${colors[color]} px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/30 disabled:opacity-60`}
    >
      {children}
    </button>
  );
}

export default Button;
