"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import "../../../../styles/tailwind.css";
import { FiRefreshCw } from "react-icons/fi";
import { FiArrowLeft } from "react-icons/fi";

export default function EditUser() {
  const router = useRouter();
  const { id: userId } = useParams();
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);

  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/users?id=${userId}`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch user data");

        const data = await res.json();
        setUser({
          name: data.name,
          email: data.email,
          role: data.role,
          password: "Default123",
        });
        setIsPasswordChanged(false);
        setLoading(false);
      } catch (err) {
        setError("Error loading user data");
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setPasswordError(null);

    if (!user.name.trim() || !user.email.trim() || !user.role.trim()) {
      setError("All fields except password are required.");
      return;
    }

    if (user.name.trim().length < 3) {
      setError("Name must be at least 3 characters long.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email.trim())) {
      setError("Invalid email format.");
      return;
    }

    if (!["Lead", "Team"].includes(user.role)) {
      setError("Invalid role selected.");
      return;
    }

    const updatedData: any = {
      id: userId,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    if (isPasswordChanged && user.password.length > 0) {
      if (user.password.length < 8) {
        setPasswordError("Password must be at least 8 characters long.");
        return;
      }
      updatedData.password = user.password;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-2xl text-gray-600">Loading...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center p-5">
      <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-8 transform transition-all duration-500 hover:scale-105">
        <h2 className="text-3xl font-extrabold text-indigo-700 text-center mb-6">
          Edit User
        </h2>

        {success && (
          <div className="mb-4 p-3 text-green-700 bg-green-200 border border-green-500 rounded-lg text-center">
            User updated successfully! Redirecting...
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 text-red-700 bg-red-200 border border-red-500 rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Name
            </label>
            <input
              type="text"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Role
            </label>
            <select
              value={user.role}
              onChange={(e) => setUser({ ...user, role: e.target.value })}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Select Role</option>
              <option value="Lead">Lead</option>
              <option value="Team">Team</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Password (Optional)
            </label>
            <input
              type="password"
              value={user.password}
              onFocus={() => {
                if (!isPasswordChanged) {
                  setUser({ ...user, password: "" });
                  setIsPasswordChanged(true);
                }
              }}
              onBlur={() => {
                if (!user.password) {
                  setUser({ ...user, password: "Default123" });
                  setIsPasswordChanged(false);
                }
              }}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {passwordError && (
              <p className="text-red-500 text-sm mt-1">{passwordError}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center gap-2 justify-center px-5 py-2 
              rounded-lg font-bold text-lg transition-all duration-300 
              backdrop-blur-lg border border-indigo-500 text-indigo-500 
              shadow-md shadow-indigo-500/20 
              ${
                loading
                  ? "cursor-not-allowed opacity-60"
                  : "hover:bg-indigo-600 hover:text-white hover:shadow-indigo-500/40 active:scale-95"
              }`}
          >
            {loading ? (
              <>
                <FiRefreshCw className="animate-spin" size={18} />
                Updating...
              </>
            ) : (
              <>
                <FiRefreshCw size={18} />
                Update
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="w-full flex items-center gap-2 justify-center px-5 py-2 
             rounded-lg font-bold text-lg transition-all duration-300 
             backdrop-blur-lg border border-gray-500 text-gray-500 
             shadow-md shadow-gray-500/20 
             hover:bg-gray-600 hover:text-white hover:shadow-gray-500/40 active:scale-95"
          >
            <FiArrowLeft size={18} />
            Back to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
