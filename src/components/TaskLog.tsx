"use client";

import { useState, useEffect } from "react";

interface TaskLog {
  id: string;
  taskId: string;
  action: string;
  description: string;
  message: string;
  timestamp: string;
  task: {
    taskCode: string;
    lead: { name: string } | null;
    team: { name: string } | null;
  };
}

const formatDateWIB = (timestamp: string) => {
  const date = new Date(timestamp);
  return (
    date
      .toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Jakarta",
      })
      .replace(/\./g, ":")
      .replace(",", "") + " WIB"
  );
};

const getStatusStyle = (status: string) => {
  console.log("status : ", status);
  switch (status) {
    case "Task Created (Status: Not Started)":
      return "bg-gray-300 text-gray-800";
    case "Task Progressed (Status: On Progress)":
      return "bg-blue-300 text-blue-800";
    case "Task Completed (Status: Done)":
      return "bg-green-300 text-green-800";
    case "Task Rejected (Status: Reject)":
      return "bg-red-300 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatStatus = (status: string) => {
  if (status.includes("Not Started")) return "Not Started";
  if (status.includes("Progressed")) return "On Progress";
  if (status.includes("Completed")) return "Done";
  if (status.includes("Rejected")) return "Reject";
  return status;
};

const TaskLog = () => {
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchTaskLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/TaskLogs", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error fetching task logs");
      }

      const data = await response.json();
      setTaskLogs(data);
    } catch (error) {
      console.error("Error fetching task logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskLogs();
  }, []);

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md max-h-[calc(100vh-7rem)] overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Task Logs</h2>

      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <svg
            className="animate-spin h-8 w-8 text-indigo-600"
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
          <span className="ml-2">Loading...</span>
        </div>
      ) : (
        <ul className="space-y-4">
          {taskLogs.map((log) => (
            <li
              key={log.id}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-indigo-600"
            >
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Task Code :</p>
                <p className="text-lg font-semibold text-indigo-600">
                  {log.task.taskCode}
                </p>

                <p className="text-sm font-medium text-gray-500">
                  Created By :
                </p>
                <p className="text-lg font-semibold text-gray-800">
                  {log.task.lead?.name || "Unknown"}
                </p>

                <p className="text-sm font-medium text-gray-500">Assign To :</p>
                <p className="text-lg font-semibold text-gray-800">
                  {log.task.team?.name || "Not Assigned"}
                </p>

                <p className="text-sm font-medium text-gray-500">Action :</p>
                <span
                  className={`px-3 py-1 rounded-md font-semibold text-sm ${getStatusStyle(
                    log.action
                  )}`}
                >
                  {formatStatus(log.action)}
                </span>

                <p className="text-sm font-medium text-gray-500">
                  Description:
                </p>
                <p className="text-lg font-semibold text-gray-800">
                  {log.description || "-"}
                </p>

                <p className="text-sm font-medium text-gray-500">Message :</p>
                <p className="text-lg font-semibold text-gray-800">
                  {log.message}
                </p>

                <p className="text-sm font-medium text-gray-500">
                  Updated At :
                </p>
                <p className="text-lg font-semibold text-gray-800">
                  {formatDateWIB(log.timestamp)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskLog;
