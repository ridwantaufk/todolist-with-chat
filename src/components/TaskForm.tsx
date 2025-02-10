import { useState, useEffect } from "react";

interface TaskFormProps {
  onTaskCreated: () => void;
}

export default function TaskForm({ onTaskCreated }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("NOT_STARTED");
  const [assignedTo, setAssignedTo] = useState<string | null>(null); // Ditugaskan ke
  const [createdBy, setCreatedBy] = useState<string | null>(null); // Dibuat oleh
  const [users, setUsers] = useState<any[]>([]); // Menyimpan daftar pengguna

  useEffect(() => {
    // Ambil semua pengguna dari API
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
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
      leadId: createdBy, // ID user yang membuat tugas
      teamId: assignedTo, // ID user yang ditugaskan ke tugas
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
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="NOT_STARTED">Not Started</option>
          <option value="ON_PROGRESS">On Progress</option>
          <option value="DONE">Done</option>
          <option value="REJECT">Reject</option>
        </select>
      </div>
      <div>
        <label>Assigned To</label>
        <select
          value={assignedTo || ""}
          onChange={(e) => setAssignedTo(e.target.value)}
        >
          <option value="">Select a user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Created By</label>
        <select
          value={createdBy || ""}
          onChange={(e) => setCreatedBy(e.target.value)}
        >
          <option value="">Select a user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>
      <button type="submit">Create Task</button>
    </form>
  );
}
