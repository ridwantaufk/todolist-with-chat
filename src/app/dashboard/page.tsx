"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TaskForm from "../../components/TaskForm";
import TaskList from "../../components/TaskList";
import TaskLog from "../../components/TaskLog";
import "../../styles/tailwind.css";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isTaskLogOpen, setIsTaskLogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/dashboard", {
          method: "GET",
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

  if (loading)
    return <div className="text-center text-2xl text-gray-600">Loading...</div>;

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 min-h-screen text-white py-10">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl p-8 px-6 space-y-6">
        <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-6">
          Welcome, {user?.name || "Guest"}
        </h1>

        <div className="flex justify-between mb-6">
          <button
            onClick={() => router.push(`/users/edit/${user?.id}`)}
            className="px-6 py-2 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transform transition-all duration-300 hover:scale-105"
          >
            Edit Profile
          </button>

          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transform transition-all duration-300 hover:scale-105"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative">
          <div
            className={`${
              user?.role === "Lead" && isTaskLogOpen
                ? "lg:col-span-2"
                : "lg:col-span-3"
            } transition-all duration-500`}
          >
            {user?.role === "Lead" && (
              <TaskForm onTaskCreated={handleTaskCreated} />
            )}
          </div>

          {/* kalo role bukan Lead, TaskLog akan muncul di bawah TaskList */}
          {user?.role === "Lead" && (
            <div className="absolute top-0 right-0 z-20">
              <button
                onClick={() => setIsTaskLogOpen(!isTaskLogOpen)}
                className="inline-flex items-center justify-center text-blue-500 hover:text-blue-700 focus:outline-none px-4 py-2 bg-blue-100 rounded-md shadow-lg transform transition-all duration-300 hover:scale-105"
              >
                {isTaskLogOpen ? (
                  <span className="text-sm font-medium">Minimize</span>
                ) : (
                  <span className="text-sm font-medium">Open Task Logs</span>
                )}
              </button>
            </div>
          )}

          <div
            className={`lg:col-span-1 transform transition-all duration-500 ${
              isTaskLogOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            style={{
              maxHeight: "calc(100vh - 4rem)",
            }}
          >
            {user?.role === "Lead" && (
              <div className="bg-white shadow-lg rounded-xl h-full">
                <div className="text-gray-700 flex justify-between items-center p-4 border-b">
                  <h3 className="font-bold text-lg">Task Logs</h3>
                </div>
                <div className="overflow-y-auto max-h-[calc(100vh-7rem)]">
                  <TaskLog />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TaskList */}
        <TaskList tasks={user?.tasks || []} role={user?.role || "Team"} />

        {/* taskLog di bawah TaskList kalo role bukan Lead */}
        {user?.role !== "Lead" && (
          <div className="mt-6 text-gray-700">
            <h2 className="text-3xl font-bold text-center p-4 text-gray-600 mb-8 shadow-md rounded-xl">
              Task Logs
            </h2>
            <TaskLog />
          </div>
        )}
      </div>
    </div>
  );
}
