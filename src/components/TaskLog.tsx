"use client";

import { useState, useEffect } from "react";

interface TaskLog {
  id: string;
  taskId: string;
  action: string;
  description: string;
  message: string;
  timestamp: string;
}

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
      console.log(data);
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
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <p className="text-lg text-gray-400">Loading...</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {taskLogs.map((log) => (
            <li
              key={log.id}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Task ID:</p>
                <p className="text-lg font-semibold text-gray-800">
                  {log.taskId}
                </p>

                <p className="text-sm font-medium text-gray-500">Action:</p>
                <p className="text-lg font-semibold text-gray-800">
                  {log.action}
                </p>

                <p className="text-sm font-medium text-gray-500">
                  Description:
                </p>
                <p className="text-lg font-semibold text-gray-800">
                  {log.description}
                </p>

                <p className="text-sm font-medium text-gray-500">Message:</p>
                <p className="text-lg font-semibold text-gray-800">
                  {log.message}
                </p>

                <p className="text-sm font-medium text-gray-500">Timestamp:</p>
                <p className="text-lg font-semibold text-gray-800">
                  {new Date(log.timestamp).toLocaleString()}
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
