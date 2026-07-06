import { useState, useRef, useEffect, useMemo } from "react";

// A lightweight, dependency-free searchable dropdown.
// Props:
//   value       — the selected option's value
//   onChange    — called with the chosen value
//   options     — array of { value, label }
//   placeholder — shown when nothing is selected
//   disabled    — when true, acts like a read-only field
//   className   — styling for the closed "control" box (usually the shared inputCls)
function SearchableSelect({ value, onChange, options = [], placeholder = "Select…", disabled = false, className = "" }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef(null);
  const searchRef = useRef(null);

  const selected = options.find((o) => o.value === value) || null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  // Close when clicking outside the component.
  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) close();
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // Focus the search box as soon as the menu opens.
  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  function close() {
    setOpen(false);
    setQuery("");
  }
  function choose(val) {
    onChange(val);
    close();
  }
  function onKeyDown(e) {
    if (e.key === "Escape") close();
    else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered.length > 0) choose(filtered[0].value);
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => (open ? close() : setOpen(true))}
        className={`${className} flex items-center justify-between gap-2 text-left`}
      >
        <span className={`truncate ${selected ? "text-slate-800" : "text-slate-400"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <svg className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && !disabled && (
        <div className="absolute z-30 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-card overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search name or ID…"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div className="max-h-56 overflow-y-auto scrollbar-slim py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-slate-400">No matches</p>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => choose(o.value)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-brand-50 ${
                    o.value === value ? "bg-brand-50/60 text-brand-700 font-medium" : "text-slate-700"
                  }`}
                >
                  {o.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchableSelect;
