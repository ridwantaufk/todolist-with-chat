"use client";

import { useEffect, useState } from "react";

interface TaskListProps {
  tasks: any[];
  role: string;
}

export default function TaskList({ tasks, role }: TaskListProps) {
  const [localTasks, setLocalTasks] = useState<any[]>(tasks);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/tasks", {
          method: "GET",
          credentials: "include",
        });

        // console.log("response : ", response);

        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }

        const data = await response.json();
        setLocalTasks(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Task List ({role})</h2>
      <ul>
        {localTasks.map((task) => (
          <li key={task.id}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>Status: {task.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
