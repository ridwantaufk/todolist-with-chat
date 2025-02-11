"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../../../styles/tailwind.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!email.trim() || !password.trim()) {
      setError("Email dan password wajib diisi.");
      setLoading(false);
      return;
    }

    if (!validateEmail(email.trim())) {
      setError("Format email tidak valid.");
      setLoading(false);
      return;
    }

    if (password.trim().length < 8) {
      setError("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      document.cookie = `token=${data.token}; path=/;`;
      setSuccess(true);

      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } else {
      setError(data.error || "Login gagal. Coba lagi.");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-lg p-8 transform transition-all duration-500 hover:scale-105">
        <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-6">
          Login
        </h2>

        {success && (
          <div className="mb-4 p-3 text-green-700 bg-green-200 border border-green-500 rounded-lg text-center">
            Login berhasil! Mengalihkan ke dashboard...
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 text-red-700 bg-red-200 border border-red-500 rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transform transition-all duration-300 hover:scale-105 disabled:bg-gray-400"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Belum punya akun?{" "}
          <Link
            href="/auth/register"
            className="text-indigo-600 font-semibold hover:underline hover:text-indigo-800 transition-all duration-300"
          >
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
