import { useState } from "react";

function Input({ label, type = "text", value, onChange, placeholder, name, error, disabled = false }) {
  const [show, setShow] = useState(false);

  // Password fields get a show/hide (eye) toggle.
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-xl border bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:bg-white focus:ring-4 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed ${
            isPassword ? "pr-11" : ""
          } ${
            error
              ? "border-rose-300 focus:border-rose-400 focus:ring-rose-500/15"
              : "border-slate-200 focus:border-brand-400 focus:ring-brand-500/15"
          }`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            tabIndex={-1}
            aria-label={show ? "Hide password" : "Show password"}
            title={show ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {show ? (
              // eye-off
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c5.5 0 9.27 5 10 7.5a13 13 0 0 1-2.16 3.19M6.6 6.6C4 8.2 2.5 10.5 2 11.5c.73 2.5 4.5 7.5 10 7.5a9.7 9.7 0 0 0 4.9-1.34" />
                <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                <line x1="3" y1="3" x2="21" y2="21" />
              </svg>
            ) : (
              // eye
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>

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
