"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TaskForm from "../../components/TaskForm";
import TaskList from "../../components/TaskList";
import TaskLog from "../../components/TaskLog";
import Chat from "../../components/Communication/Chat";
import "../../styles/tailwind.css";
import { FiLogOut } from "react-icons/fi";
import { FiEdit } from "react-icons/fi";
import { FaBell } from "react-icons/fa";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [isTaskLogOpen, setIsTaskLogOpen] = useState(false);
  const router = useRouter();

  const handleEditProfile = async () => {
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    router.push(`/users/edit/${user?.id}`);
    setIsLoading(false);
  };

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
    setLoading(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        router.push("/auth/login");
      } else {
        console.error("Logout failed:", await response.text());
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleNewMessage = () => {
      if (!isChatVisible) {
        setHasNewMessage(true);
        playNotificationSound();
      }
    };
    window.addEventListener("newChatMessage", handleNewMessage);

    return () => {
      window.removeEventListener("newChatMessage", handleNewMessage);
    };
  }, [isChatVisible]);

  const playNotificationSound = () => {
    const audio = new Audio("/sounds/iphone-notif.mp3");
    audio.play();
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-white animate-gradient">
        <div className="loader"></div>
        <div className="loading-text">Loading</div>
      </div>
    );

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 min-h-screen text-white py-10">
      <div className="fixed bottom-10 right-10 z-40">
        {hasNewMessage && (
          <FaBell
            className="absolute -top-2 -right-2 text-red-500 animate-bounce"
            size={20}
          />
        )}
        <Chat
          isChatVisible={isChatVisible}
          setIsChatVisible={setIsChatVisible}
        />{" "}
      </div>
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl p-8 px-6 space-y-4">
        <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-6">
          Welcome, {user?.name || "Guest"}
        </h1>

        <div className="flex justify-between mb-6">
          <button
            onClick={handleEditProfile}
            className={`px-5 py-2 flex items-center gap-2 rounded-lg 
              backdrop-blur-lg border border-green-500 text-green-500 
              shadow-md shadow-green-500/20 transition-all duration-300 
              ${
                isLoading
                  ? "cursor-not-allowed opacity-60"
                  : "hover:bg-green-600 hover:text-white hover:shadow-green-500/40 active:scale-95"
              }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 text-green-600"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 100 8v4a8 8 0 01-8-8z"
                  />
                </svg>
                Loading...
              </div>
            ) : (
              <>
                <FiEdit size={18} />
                Edit Profile
              </>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="px-5 py-2 flex items-center gap-2 
             bg-transparent border border-red-500 text-red-500 
             rounded-lg backdrop-blur-lg shadow-md shadow-red-500/20 
             transition-all duration-300 hover:bg-red-600 hover:text-white 
             hover:shadow-red-500/40 active:scale-95"
          >
            <FiLogOut size={18} />
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 relative">
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
            className={`lg:col-span-1 transform transition-all duration-300 ${
              isTaskLogOpen
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95 hidden"
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
