function Input({ label, type = "text", value, onChange, placeholder, name, error }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:bg-white focus:ring-4 ${
          error
            ? "border-rose-300 focus:border-rose-400 focus:ring-rose-500/15"
            : "border-slate-200 focus:border-brand-400 focus:ring-brand-500/15"
        }`}
      />
      {error && (
        <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
          <span className="inline-block h-1 w-1 rounded-full bg-rose-500" />
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;
