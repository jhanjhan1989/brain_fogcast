import React, { useState, ChangeEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  role: "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER" | "QA" | "CLIENT";
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>({
    fullName: "",
    email: "",
    password: "",
    role: "CLIENT",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const register = async () => {
    if (!form.fullName || !form.email || !form.password || !form.role) {
      alert("All fields are required!");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || ""}/api/v1/auth/register`,
        form
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("Account created successfully!");
      navigate("/");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-purple-600 dark:text-purple-400 mb-6">
          Create Account
        </h2>

        <div className="space-y-4">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 
            focus:ring-purple-500 transition dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 
            focus:ring-purple-500 transition dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border pr-12 focus:outline-none focus:ring-2 
              focus:ring-purple-500 transition dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            />
            <button
              type="button"
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 dark:text-gray-300"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            onClick={register}
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition 
            ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"}`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
