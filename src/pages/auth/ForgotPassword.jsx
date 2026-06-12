import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import Logo from "../../components/common/Logo.jsx";

// NOTE: Design only — this page does not call any backend yet.
// On submit it just shows a confirmation state.
function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    // No API call (design only) — just show the success/confirmation UI.
    setSent(true);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel (hidden on small screens) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-brand-gradient text-white p-12 flex-col items-center justify-center text-center">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 -left-20 h-72 w-72 rounded-full bg-emerald-900/20 blur-3xl" />

        <div className="relative flex flex-col items-center">
          <div className="flex flex-col items-center gap-3 mb-10">
            <div className="h-20 w-20 rounded-2xl bg-white/15 ring-1 ring-white/30 flex items-center justify-center font-extrabold text-4xl shadow-lg">
              R
            </div>
            <div className="leading-tight text-center">
              <p className="font-extrabold tracking-tight text-2xl">RAC</p>
              <p className="text-sm text-white/70">CRM Suite</p>
            </div>
          </div>

          <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
            Forgot your<br />password?
          </h2>
          <p className="mt-4 text-white/80 max-w-sm">
            No worries — enter your email and we'll send you a secure link to
            reset it.
          </p>
        </div>

        <p className="absolute bottom-10 left-0 right-0 text-center text-xs text-white/60">
          © {`${new Date().getFullYear()}`} RAC CRM. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 app-surface flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="flex justify-center lg:hidden mb-6 scale-125">
            <Logo />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-card p-8">
            {!sent ? (
              <>
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Reset password</h1>
                <p className="text-sm text-slate-500 mt-1 mb-6">
                  Enter the email linked to your account.
                </p>

                <form onSubmit={handleSubmit} noValidate>
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                  />

                  <Button type="submit" color="green" className="w-full mt-1">
                    Send reset link
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-brand-gradient text-white flex items-center justify-center shadow-glow-sm mb-4">
                  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3.5 6.5h17v11h-17z" />
                    <path d="m4 7 8 6 8-6" />
                  </svg>
                </div>
                <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Check your email</h1>
                <p className="text-sm text-slate-500 mt-2">
                  If an account exists for <span className="font-semibold text-slate-700">{email}</span>,
                  a password reset link is on its way.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="text-sm text-brand-600 hover:text-brand-700 hover:underline mt-4 font-medium"
                >
                  Use a different email
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full mt-5 flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
