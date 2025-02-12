import { useState, useEffect } from "react";
interface User {
  id: string;
  name: string;
}

interface TaskFormProps {
  onTaskCreated: () => void;
}

export default function TaskForm({ onTaskCreated }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("NOT_STARTED");
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [createdBy, setCreatedBy] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>("");
  const [notification, setNotification] = useState<string>("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
          setCreatedBy(data.userName);
        } else {
          console.error("Failed to fetch users");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotification("");

    if (!title.trim()) return setError("Title is required");
    if (!description.trim()) return setError("Description is required");
    if (!assignedTo) return setError("Please select a user to assign");

    const newTask = {
      title,
      description,
      status,
      leadId: createdBy?.id,
      teamId: assignedTo,
    };

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });

      if (response.ok) {
        setNotification("Task created successfully!");
        onTaskCreated();
        setTitle("");
        setDescription("");
        setStatus("NOT_STARTED");
        setAssignedTo(null);
        setTimeout(() => setNotification(""), 3000);
      } else {
        setError("Failed to create task");
      }
    } catch (error) {
      setError("Error creating task");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6"
    >
      <h2 className="text-3xl font-semibold text-center text-indigo-700">
        Create Task
      </h2>

      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded-lg shadow-md">
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200 text-gray-900"
          />
        </div>

        <div className="bg-gray-100 p-4 rounded-lg shadow-md">
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`w-full p-2 border-2 rounded-md focus:outline-none transition duration-200
    ${
      status === ""
        ? "bg-transparent text-gray-900 border-gray-300 font-bold"
        : ""
    }
    ${
      status === "NOT_STARTED"
        ? "bg-gray-300 text-gray-800 border-gray-300"
        : ""
    }
    ${
      status === "ON_PROGRESS"
        ? "bg-blue-300 text-blue-800 border-blue-300"
        : ""
    }
    ${status === "DONE" ? "bg-green-300 text-green-800 border-green-300" : ""}
    ${status === "REJECT" ? "bg-red-300 text-red-800 border-red-300" : ""}
    ${status === "" ? "bg-gray-100 text-gray-800 border-gray-300" : ""}
    font-bold`}
            style={{
              appearance: "none",
              backgroundColor: "transparent",
              WebkitAppearance: "none",
              MozAppearance: "none",
            }}
          >
            <option value="">Select Status</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="ON_PROGRESS">On Progress</option>
            <option value="DONE">Done</option>
            <option value="REJECT">Reject</option>
          </select>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg shadow-md">
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Description
          </label>
          <textarea
            value={description}
            placeholder="Description"
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200 text-gray-900"
            rows={4}
          />
        </div>

        <div className="bg-gray-100 p-4 rounded-lg shadow-md">
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Assigned To
          </label>
          <select
            value={assignedTo || ""}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200 text-gray-900"
          >
            <option value="">Select a user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg shadow-md">
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Created By
          </label>
          <select
            value={createdBy?.id || ""}
            onChange={(e) =>
              setCreatedBy(
                users.find((user) => user.id === e.target.value) || null
              )
            }
            className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200 text-gray-900"
          >
            <option value="">Select a user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && <div className="text-red-500 text-center">{error}</div>}
      {notification && (
        <div className="text-green-500 text-center">{notification}</div>
      )}
      <button
        type="submit"
        disabled={!!notification}
        className={`w-full text-white font-semibold py-2 rounded-md shadow-md transition duration-200 ${
          notification
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-indigo-500 hover:bg-indigo-600"
        }`}
      >
        Create Task
      </button>
    </form>
  );
}
