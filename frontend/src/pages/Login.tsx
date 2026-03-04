import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../data/authService";
import { useAuth } from "../hooks/useAuth";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { user, token } = await loginUser({ email, password });
      login(user, token);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-md p-8 transition-colors">
        <h2 className="text-3xl font-bold text-center text-purple-600 dark:text-purple-400 mb-6">
          Sign In
        </h2>

        {error && (
          <div className="mb-4 text-red-600 bg-red-100 border border-red-300 rounded-lg p-2 text-center text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block">
              Email
            </label>
            <input
              type="email"
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 
              focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="relative">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 
              focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="absolute top-1/2 right-3 transform -translate-y-1/2 
              text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg 
            font-semibold transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
          Don’t have an account?{" "}
          <a
            href="/register"
            className="text-purple-500 hover:underline dark:text-purple-400"
          >
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
