import { useState, useRef } from "react";

interface Task {
  id: string;
  title: string;
  status: string;
  description: string;
}

interface TaskListProps {
  tasks: Task[];
  role: "Lead" | "Team";
}

export default function TaskList({ tasks, role }: TaskListProps) {
  const [taskList, setTaskList] = useState<Task[]>(tasks);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editedDescription, setEditedDescription] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [taskToSave, setTaskToSave] = useState<string | null>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setTaskList((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditDescription = (
    taskId: string,
    currentDescription: string
  ) => {
    setEditingTask(taskId);
    setEditedDescription(currentDescription);
    setTimeout(() => descRef.current?.focus(), 0);
  };

  const handleSaveDescription = async (taskId: string) => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const res = await fetch(`/api/tasks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: taskId, description: editedDescription }),
      });

      if (!res.ok) throw new Error("Failed to update description");

      setTaskList((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? { ...task, description: editedDescription }
            : task
        )
      );
      setEditingTask(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBlur = (taskId: string) => {
    const originalDescription =
      taskList.find((task) => task.id === taskId)?.description.trim() || "";
    const currentDescription = editedDescription.trim();

    if (currentDescription !== originalDescription) {
      if (isSaving) return;
      setTaskToSave(taskId);
      setIsConfirmOpen(true);
    } else {
      setEditingTask(null);
    }
  };

  const handleConfirmSave = () => {
    if (taskToSave) {
      handleSaveDescription(taskToSave);
    }
    setIsConfirmOpen(false);
  };

  const handleCancelSave = () => {
    if (taskToSave) {
      const originalDescription =
        taskList.find((task) => task.id === taskToSave)?.description || "";
      setEditedDescription(originalDescription);
    }
    setEditingTask(null);
    setIsConfirmOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-3xl font-bold text-center p-2 text-gray-600 mb-8 shadow-md">
        {role} Tasks
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {taskList.length > 0 ? (
          taskList.map((task) => (
            <div
              key={task.id}
              className="bg-white p-6 rounded-lg shadow-xl border border-gray-200 transform transition-transform duration-300 hover:scale-105"
            >
              <h3 className="text-xl font-bold text-gray-900">{task.title}</h3>

              <div className="mt-2">
                <label className="text-sm font-semibold text-gray-700">
                  Status
                </label>
                <select
                  className="mt-1 block w-full bg-gray-100 text-gray-800 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                >
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="ON_PROGRESS">On Progress</option>
                  <option value="DONE">Done</option>
                  <option value="REJECT">Reject</option>
                </select>
              </div>

              <div className="mt-4">
                <label className="text-sm font-semibold text-gray-700">
                  Description
                </label>
                {editingTask === task.id ? (
                  <div className="relative">
                    <textarea
                      ref={descRef}
                      className="mt-1 w-full bg-gray-100 text-gray-800 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[200px] max-h-[500px] overflow-y-auto resize-none transition-all duration-300 transform scale-105 sticky top-4"
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      onBlur={() => handleBlur(task.id)}
                    />
                  </div>
                ) : (
                  <p
                    className="mt-1 text-gray-600 cursor-pointer hover:text-indigo-600 transition-all min-h-[200px] max-h-[500px] overflow-y-auto"
                    onClick={() =>
                      handleEditDescription(task.id, task.description)
                    }
                  >
                    {task.description || "Click to add a description..."}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center col-span-3 text-gray-200 mt-4">
            No tasks assigned.
          </p>
        )}
      </div>

      {/* MODAL KONFIRMASI */}
      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold text-gray-800">
              Save changes?
            </h3>
            <p className="text-gray-600 mt-2">
              Are you sure you want to save the changes to this task?
            </p>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                className="bg-gray-300 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-400"
                onClick={handleCancelSave}
              >
                Cancel
              </button>
              <button
                className="bg-indigo-500 px-4 py-2 rounded-lg text-white hover:bg-indigo-600"
                onClick={handleConfirmSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT DESCRIPTION */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl overflow-auto min-h-[500px]">
            <h3 className="text-xl font-semibold text-gray-800">
              Edit Task Description
            </h3>
            <div className="mt-4">
              <label className="text-sm font-semibold text-gray-700">
                Title
              </label>
              <p className="mt-1 text-gray-600">
                {taskList.find((task) => task.id === editingTask)?.title}
              </p>
            </div>

            <div className="mt-4">
              <label className="text-sm font-semibold text-gray-700">
                Status
              </label>
              <p className="mt-1 text-gray-600">
                {taskList.find((task) => task.id === editingTask)?.status}
              </p>
            </div>

            <div className="mt-4 relative">
              <label className="text-sm font-semibold text-gray-700">
                Description
              </label>
              <textarea
                ref={descRef}
                className="mt-1 w-full bg-gray-100 text-gray-800 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[300px] max-h-[500px] overflow-y-auto resize-none"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                onBlur={() => handleBlur(editingTask)}
              />
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                className="bg-gray-300 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-400"
                onClick={handleCancelSave}
              >
                Cancel
              </button>
              <button
                className="bg-indigo-500 px-4 py-2 rounded-lg text-white hover:bg-indigo-600"
                onClick={() => handleSaveDescription(editingTask)}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
