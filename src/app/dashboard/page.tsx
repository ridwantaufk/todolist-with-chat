"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TaskForm from "../../components/TaskForm";
import TaskList from "../../components/TaskList";

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

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {user?.name || "Guest"}</h1>

      {/* Jika user adalah Lead, tampilkan TaskForm */}
      {user?.role === "Lead" && <TaskForm onTaskCreated={handleTaskCreated} />}

      {/* Tampilkan daftar tugas berdasarkan peran user */}
      <TaskList tasks={user?.tasks || []} role={user?.role || "Member"} />

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
