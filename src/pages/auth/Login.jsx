import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import Logo from "../../components/common/Logo.jsx";
import { loginStart, loginSuccess, loginFailure } from "../../redux/slices/authSlice.js";
import { loginApi } from "../../api/authApi.js";
import { loginSchema, validate } from "../../validation/schemas.js";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [input, setInput] = useState({
    email: "",
    password: "",
  });

  const eventHandlerChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const check = validate(loginSchema, input);
    if (!check.valid) {
      setErrors(check.errors);
      return;
    }
    setErrors({});

    try {
      setLoading(true);
      dispatch(loginStart());
      const data = await loginApi(input);
      dispatch(loginSuccess({ user: data.user, token: data.token }));

      if (data.user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/employee/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Login failed:", error);
      const message =
        error.response?.data?.message ||
        "Login failed. Please check your email and password.";
      dispatch(loginFailure(message));
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel (hidden on small screens) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-brand-gradient text-white p-12 flex-col items-center justify-center text-center">
        {/* decorative glows */}
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 -left-20 h-72 w-72 rounded-full bg-emerald-900/20 blur-3xl" />

        {/* Centered brand block: logo sits in the vertical middle, above the hero text */}
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
            Manage your team,<br />effortlessly.
          </h2>
          <p className="mt-4 text-white/80 max-w-sm">
            Attendance, leaves, departments and reports — all in one elegant
            workspace built for modern teams.
          </p>

          <div className="mt-8 space-y-3 inline-flex flex-col items-start text-left">
            {["Real-time attendance tracking", "Smart leave management", "Insightful reports & exports"].map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm text-white/90">
                <span className="h-6 w-6 shrink-0 rounded-full bg-white/15 ring-1 ring-white/25 flex items-center justify-center">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                {f}
              </div>
            ))}
          </div>
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
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Welcome back</h1>
            <p className="text-sm text-slate-500 mt-1 mb-6">Sign in to continue to your account.</p>

            <form onSubmit={handleLogin} noValidate>
              <Input
                label="Email"
                type="email"
                name="email"
                value={input.email}
                onChange={eventHandlerChange}
                placeholder="you@company.com"
                error={errors.email}
              />
              <Input
                label="Password"
                type="password"
                name="password"
                value={input.password}
                onChange={eventHandlerChange}
                placeholder="••••••••"
                error={errors.password}
              />

              <Button type="submit" color="green" loading={loading} className="w-full mt-1">
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="text-center text-sm text-brand-600 hover:text-brand-700 hover:underline mt-5 cursor-pointer font-medium">
              Forgot Password?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
