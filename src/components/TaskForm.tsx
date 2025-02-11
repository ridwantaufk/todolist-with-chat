import { useState, useEffect } from "react";
import "../styles/tailwind.css";

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
  const [createdBy, setCreatedBy] = useState<User | null>(null); // Menggunakan tipe User untuk createdBy
  const [users, setUsers] = useState<User[]>([]); // Menetapkan tipe array of User untuk users

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (response.ok) {
          const data = await response.json();
          console.log("data.loggedInUser : ", data.loggedInUser);

          setUsers(data.users); // Mengakses array users dari objek response
          setCreatedBy(data.loggedInUser); // Pastikan loggedInUser adalah objek yang sesuai
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      });

      if (response.ok) {
        onTaskCreated();
        setTitle("");
        setDescription("");
        setStatus("NOT_STARTED");
        setAssignedTo(null);
        setCreatedBy(null);
      } else {
        console.error("Failed to create task:", await response.text());
      }
    } catch (error) {
      console.error("Error creating task:", error);
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
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200 text-gray-900"
          />
        </div>

        <div className="bg-gray-100 p-4 rounded-lg shadow-md">
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200 text-gray-900"
            rows={4}
          />
        </div>

        <div className="bg-gray-100 p-4 rounded-lg shadow-md">
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200 text-gray-900"
          >
            <option value="NOT_STARTED">Not Started</option>
            <option value="ON_PROGRESS">On Progress</option>
            <option value="DONE">Done</option>
            <option value="REJECT">Reject</option>
          </select>
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

      <button
        type="submit"
        className="w-full bg-indigo-500 text-white font-semibold py-2 rounded-md shadow-md hover:bg-indigo-600 transition duration-200"
      >
        Create Task
      </button>
    </form>
  );
}
