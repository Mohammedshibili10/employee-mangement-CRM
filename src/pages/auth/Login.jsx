import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Input from "../../components/common/Input.jsx";
import Logo from "../../components/common/Logo.jsx";
import { loginStart, loginSuccess, loginFailure } from "../../redux/slices/authSlice.js";
import { loginApi } from "../../api/authApi.js";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState({
    email: "",
    password: "",
  });

  const eventHandlerChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm w-full max-w-sm p-8">

        <div className="mb-6">
          <div className="flex justify-center">
            <Logo />
          </div>
          <p className="text-sm text-slate-500 text-center mt-3">
            Login to your account
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <Input
            label="Email"
            type="email"
            name="email"
            value={input.email}
            onChange={eventHandlerChange}
            placeholder="you@company.com"
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={input.password}
            onChange={eventHandlerChange}
            placeholder="••••••••"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md text-sm font-medium disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-green-600 hover:underline mt-4 cursor-pointer">
          Forgot Password?
        </p>
      </div>
    </div>
  );
}

export default Login;
