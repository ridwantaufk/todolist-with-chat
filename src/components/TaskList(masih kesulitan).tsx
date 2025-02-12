// src/components/TaskList.tsx

import { useState, useRef, useEffect } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { Task, TaskListProps } from "./TaskListComponents/types";
import TaskCard from "./TaskListComponents/TaskCard";
import ConfirmationModal from "./TaskListComponents/ConfirmationModal";
import EditDescriptionModal from "./TaskListComponents/EditDescriptionModal";

export default function TaskList({ tasks, role }: TaskListProps) {
  const [assignOptions, setAssignOptions] = useState([]);
  const [taskList, setTaskList] = useState<Task[]>(tasks);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>("");
  const [editingTitle, setEditingTitle] = useState<string>("");
  const [editedDescription, setEditedDescription] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [taskToSave, setTaskToSave] = useState<string | null>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const [visible, setVisible] = useState(true);

  // Fetch users and handle effects...
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data pengguna");
        }

        const data = await response.json();
        setAssignOptions(data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-3xl font-bold text-center p-2 text-gray-600 mb-8 shadow-md">
        {role} Tasks
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {taskList.length > 0 ? (
          taskList.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              assignOptions={assignOptions}
              setEditingTask={setEditingTask}
              editingTask={editingTask}
              setEditedTitle={setEditedTitle}
              editedTitle={editedTitle} // Pass editedTitle
              editingTitle={editingTitle} // Pass editingTitle
              setEditingTitle={setEditingTitle}
              setEditedDescription={setEditedDescription}
              editedDescription={editedDescription} // Pass editedDescription
              descRef={descRef}
              handleBlurTitle={(taskId) => {
                /* Implement this function */
              }}
              handleEditDescription={(taskId, description) => {
                /* Implement this function */
              }}
              handleAssignChange={(taskId, userId) => {
                /* Implement this function */
              }}
              handleCreatedChange={(taskId, userId) => {
                /* Implement this function */
              }}
            />
          ))
        ) : (
          <p className="text-center col-span-3 text-gray-200 mt-4">
            No tasks assigned.
          </p>
        )}
      </div>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          /* Handle confirm logic */
        }}
      />

      {editingTask && (
        <EditDescriptionModal
          taskId={editingTask}
          editedDescription={editedDescription}
          setEditedDescription={setEditedDescription}
          descRef={descRef}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}
