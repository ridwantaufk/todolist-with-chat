import { useState, useRef, useEffect } from "react";
import { FaInfoCircle } from "react-icons/fa";

interface Task {
  id: string;
  title: string;
  status: string;
  description: string;
  leadId: string;
  teamId: string;
  taskCode: string;
}

interface TaskListProps {
  tasks: Task[];
  role: "Lead" | "Team";
}

export default function TaskList({ tasks, role }: TaskListProps) {
  const [assignOptions, setAssignOptions] = useState([]);
  const [taskList, setTaskList] = useState<Task[]>(tasks);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>("");
  const [editingTitle, setEditingTitle] = useState<string>("");
  const [editedStatus, setEditedStatus] = useState<string>("");
  const [editedDescription, setEditedDescription] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [taskToSave, setTaskToSave] = useState<string | null>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const [visible, setVisible] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const modalRef = useRef(null);

  // console.log("taskList : ", taskList);

  useEffect(() => {
    if (editingTitle !== null) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [editingTitle]);

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

  const handleAssignChange = (taskId, userId) => {
    setTaskList((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, teamId: userId } : task
      )
    );
    handleUpdateAssignTo(taskId, userId);
  };

  const handleCreatedChange = (taskId, userId) => {
    setTaskList((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, leadId: userId } : task
      )
    );
    handleUpdateCreatedBy(taskId, userId);
  };

  const handleBlurAssign = (taskId: string) => {
    const task = taskList.find((t) => t.id === taskId);
    if (task) {
      handleAssignChange(taskId, task.teamId);
    }
  };

  const handleBlurCreated = (taskId: string) => {
    const task = taskList.find((t) => t.id === taskId);
    if (task) {
      handleCreatedChange(taskId, task.leadId);
    }
  };

  const handleUpdateAssignTo = async (taskId: string, userId: string) => {
    try {
      const res = await fetch(`/api/tasks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: taskId, teamId: userId }),
      });

      if (!res.ok) throw new Error("Failed to update Assign To");
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateCreatedBy = async (taskId: string, userId: string) => {
    try {
      const res = await fetch(`/api/tasks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: taskId, leadId: userId }),
      });

      if (!res.ok) throw new Error("Failed to update Created By");
    } catch (error) {
      console.error(error);
    }
  };

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

  const handleBlurTitle = (taskId: string) => {
    const originalTitle =
      taskList.find((task) => task.id === taskId)?.title || "";
    const currentTitle = editedTitle.trim();

    if (currentTitle !== originalTitle) {
      handleSaveTitle(taskId);
    } else {
      setEditingTitle(null);
    }
  };

  const handleSaveTitle = async (taskId: string) => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const res = await fetch(`/api/tasks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: taskId, title: editedTitle }),
      });

      if (!res.ok) throw new Error("Failed to update title");

      setTaskList((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, title: editedTitle } : task
        )
      );
      setEditingTitle(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditTitle = (taskId: string, currentTitle: string) => {
    setEditingTitle(taskId);
    setEditedTitle(currentTitle);
  };

  const handleEditDescription = (taskId: string) => {
    const task = taskList.find((task) => task.id === taskId);
    if (task) {
      setEditingTask(taskId);
      setEditedTitle(task.title);
      setEditedStatus(task.status);
      setEditedDescription(task.description);
    }
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
        body: JSON.stringify({
          id: taskId,
          title: editedTitle,
          status: editedStatus,
          description: editedDescription,
        }),
      });

      if (!res.ok) throw new Error("Failed to update task");

      setTaskList((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                title: editedTitle,
                status: editedStatus,
                description: editedDescription,
              }
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
      // setEditingTask(null);
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

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        handleCancelSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleCancelSave]);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "NOT_STARTED":
        return "bg-gray-300 text-gray-800";
      case "ON_PROGRESS":
        return "bg-blue-300 text-blue-800";
      case "DONE":
        return "bg-green-300 text-green-800";
      case "REJECT":
        return "bg-red-300 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
              <div
                key={task.id}
                onClick={() => {
                  handleEditDescription(task.id);
                  setSelectedTaskId(task.id);
                }}
                onMouseDown={() => setSelectedTaskId(task.id)}
                onMouseUp={() => setSelectedTaskId(null)}
                onMouseLeave={() => setSelectedTaskId(null)}
                className={`inline-block text-sm font-semibold text-blue-500 mb-2 uppercase tracking-wide border-s-4 border-blue-500 rounded-full px-2 cursor-pointer transition-transform duration-300 transform ${
                  selectedTaskId === task.id ? "scale-110" : "scale-100"
                } hover:bg-blue-500 hover:text-white hover:translate-x-2`}
                style={{
                  transition: "transform 0.3s ease, translate 0.3s ease",
                }}
              >
                {task.taskCode}
              </div>
              {editingTitle === task.id ? (
                <div className="mt-4">
                  <input
                    type="text"
                    className="mt-1 w-full bg-gray-50 text-gray-800 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onBlur={() => handleBlurTitle(task.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleBlurTitle(task.id);
                      } else if (e.key === "Escape") {
                        setEditedTitle(task.title);
                        setEditingTitle(null);
                      }
                    }}
                    autoFocus
                  />
                  {visible && (
                    <div
                      className={`text-[10px] sm:text-[7px] md:text-[7px] lg:text-[10px] text-neutral-200 bg-gray-950 px-2 py-1 rounded inline-flex items-center ${
                        visible ? "opacity-80" : "opacity-60"
                      } transition-opacity duration-500 ease-out whitespace-nowrap`}
                    >
                      <FaInfoCircle className="mr-1" />
                      Press <span className="font-bold mx-1">
                        Enter
                      </span> or{" "}
                      <span className="font-bold mx-1">click anywhere</span> to
                      save, or <span className="font-bold mx-1">Esc</span> to
                      cancel.
                    </div>
                  )}
                </div>
              ) : (
                <h3
                  className="text-xl font-bold text-gray-900 cursor-pointer"
                  onClick={() => handleEditTitle(task.id, task.title)}
                >
                  {task.title}
                </h3>
              )}

              <div className="mt-2">
                <label className="text-sm font-semibold text-gray-700">
                  Status
                </label>
                <select
                  className={`mt-1 block w-full py-2 px-3 rounded-md ${getStatusStyles(
                    task.status
                  )} focus:outline-none focus:ring-0`}
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
                      className="mt-1 w-full bg-gray-100 text-gray-800 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-200 min-h-[200px] max-h-[500px] overflow-y-auto resize-none transition-all duration-300 transform scale-105 sticky top-4"
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      onBlur={() => handleBlur(task.id)}
                    />
                  </div>
                ) : (
                  <p
                    className="mt-1 text-gray-600 cursor-pointer hover:text-indigo-600 transition-all min-h-[200px] max-h-[500px] overflow-y-auto"
                    onClick={() => handleEditDescription(task.id)}
                  >
                    {task.description || "Click to add a description..."}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <label className="text-sm font-semibold text-gray-700">
                  Assign To
                </label>
                <select
                  className="mt-1 block w-full py-2 px-3 rounded-md border border-gray-400 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={task.teamId || ""}
                  onChange={(e) => handleAssignChange(task.id, e.target.value)}
                  onBlur={() => handleBlurAssign(task.id)}
                >
                  <option value="">Select a user</option>
                  {assignOptions.length > 0 ? (
                    assignOptions.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))
                  ) : (
                    <option disabled className="text-gray-500">
                      Loading users...
                    </option>
                  )}
                </select>
              </div>

              <div className="mt-2">
                <label className="text-sm font-semibold text-gray-700">
                  Created By
                </label>
                <select
                  className="mt-1 block w-full py-2 px-3 rounded-md border border-gray-400 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={task.leadId || ""}
                  onChange={(e) => handleCreatedChange(task.id, e.target.value)}
                  onBlur={() => handleBlurCreated(task.id)}
                >
                  <option value="">Select a user</option>
                  {assignOptions.length > 0 ? (
                    assignOptions.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))
                  ) : (
                    <option disabled className="text-gray-500">
                      Loading users...
                    </option>
                  )}
                </select>
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
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCancelSave}
        >
          <div
            ref={modalRef}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl overflow-auto min-h-[500px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-gray-800">
              Edit Task Description
            </h3>

            <div className="mt-4">
              <label className="text-sm font-semibold text-gray-700">
                Title
              </label>
              <input
                type="text"
                className="mt-1 w-full bg-gray-100 text-gray-800 border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
              />
            </div>

            <div className="mt-4">
              <label className="text-sm font-semibold text-gray-700">
                Status
              </label>
              <select
                className={`mt-1 block w-full py-2 px-3 rounded-md ${getStatusStyles(
                  editedStatus
                )} border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={editedStatus}
                onChange={(e) => setEditedStatus(e.target.value)}
              >
                <option value="NOT_STARTED">Not Started</option>
                <option value="ON_PROGRESS">On Progress</option>
                <option value="DONE">Done</option>
                <option value="REJECT">Reject</option>
              </select>
            </div>

            <div className="mt-4 relative">
              <label className="text-sm font-semibold text-gray-700">
                Description
              </label>
              <textarea
                className="mt-1 w-full bg-gray-100 text-gray-800 border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-200 min-h-[300px] max-h-[500px] overflow-y-auto resize-none"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
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
