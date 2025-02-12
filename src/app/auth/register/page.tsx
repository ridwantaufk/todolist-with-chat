"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "../../../styles/tailwind.css";
import { FiUserPlus } from "react-icons/fi";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    if (name.trim().length < 3) {
      setError("Name must be at least 3 characters long.");
      setLoading(false);
      return;
    }

    if (!validateEmail(email.trim())) {
      setError("Invalid email format.");
      setLoading(false);
      return;
    }

    if (password.trim().length < 8) {
      setError("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    if (password.trim() !== confirmPassword.trim()) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (!["Lead", "Team"].includes(role)) {
      setError("Invalid role selected.");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await response.json();
    if (response.ok) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } else {
      setError(data.error || "Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-lg p-8 transform transition-all duration-500 hover:scale-105">
        <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-6">
          Register
        </h2>

        {success && (
          <div className="mb-4 p-3 text-green-700 bg-green-200 border border-green-500 rounded-lg text-center">
            Registration successful! Redirecting to login...
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 text-red-700 bg-red-200 border border-red-500 rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            className="w-full p-2 border rounded-lg"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            className="w-full p-2 border rounded-lg"
            placeholder="Email (ex: name@example.com)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full p-2 border rounded-lg"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full p-2 border rounded-lg"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <select
            className="w-full p-2 border rounded-lg"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">Select Role</option>
            <option value="Lead">Lead</option>
            <option value="Team">Team</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center gap-2 justify-center px-5 py-2 
              rounded-lg font-bold text-lg transition-all duration-300 
              backdrop-blur-lg border border-indigo-500 text-indigo-500 
              shadow-md shadow-indigo-500/20 
              ${
                loading
                  ? "cursor-not-allowed opacity-60 bg-gray-400 text-gray-700"
                  : "hover:bg-indigo-600 hover:text-white hover:shadow-indigo-500/40 active:scale-95"
              }`}
          >
            {loading ? (
              <>
                <FiUserPlus className="animate-pulse" size={18} />
                Registering...
              </>
            ) : (
              <>
                <FiUserPlus size={18} />
                Register
              </>
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a
            href="/auth/login"
            className="text-indigo-600 font-semibold hover:underline hover:text-indigo-800 transition-all duration-300"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
