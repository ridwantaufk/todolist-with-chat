"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TaskForm from "../../components/TaskForm";
import TaskList from "../../components/TaskList";
import "../../styles/tailwind.css";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/dashboard", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          console.error(
            "Server responded with an error:",
            await response.text()
          );
          router.push("/auth/login");
          return;
        }

        const data = await response.json();

        console.log("data : ", data);

        setUser(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleTaskCreated = async () => {
    try {
      const response = await fetch("/api/dashboard", {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to refresh user data");

      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error("Error refreshing tasks:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        router.push("/auth/login");
      } else {
        console.error("Logout failed:", await response.text());
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) return <div className="text-center text-2xl">Loading...</div>;

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 min-h-screen text-white py-10 px-5">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-xl p-8 space-y-6 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
        <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-6">
          Welcome, {user?.name || "Guest"}
        </h1>

        {/* Tombol Edit Profile di kiri dan Logout di kanan */}
        <div className="flex justify-between mb-6">
          <button
            onClick={() => router.push(`/users/edit/${user?.id}`)}
            className="px-6 py-2 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transform transition-all duration-300 hover:scale-105"
          >
            Edit Profile
          </button>

          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transform transition-all duration-300 hover:scale-105"
          >
            Logout
          </button>
        </div>

        {/* Jika user adalah Lead, tampilkan TaskForm */}
        {user?.role === "Lead" && (
          <TaskForm onTaskCreated={handleTaskCreated} />
        )}

        {/* Tampilkan daftar tugas berdasarkan peran user */}
        <TaskList tasks={user?.tasks || []} role={user?.role || "Team"} />
      </div>
    </div>
  );
}
