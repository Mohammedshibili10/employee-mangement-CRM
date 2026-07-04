import React from "react";

// Catches any runtime error in the React tree and shows a friendly, actionable
// screen instead of a blank white page. Also gives the user a one-click way to
// clear a possibly-corrupt session and return to login.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("App crashed:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch {
      /* ignore */
    }
    window.location.href = "/login";
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen app-surface flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/70 shadow-card p-8 text-center animate-fade-in-up">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Something went wrong</h1>
          <p className="text-sm text-slate-500 mt-2">
            The page hit an unexpected error. Try reloading — if it keeps happening,
            reset your session and sign in again.
          </p>

          {this.state.error?.message && (
            <pre className="mt-4 text-left text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg p-3 overflow-x-auto scrollbar-slim">
              {String(this.state.error.message)}
            </pre>
          )}

          <div className="flex gap-3 justify-center mt-5">
            <button
              onClick={this.handleReload}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-brand-gradient text-white shadow-glow-sm hover:brightness-105 active:scale-[0.97] transition-all"
            >
              Reload page
            </button>
            <button
              onClick={this.handleReset}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
            >
              Reset & sign in
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
