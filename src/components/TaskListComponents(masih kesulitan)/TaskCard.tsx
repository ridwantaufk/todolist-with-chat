import { Task } from "./types";
import { FaInfoCircle } from "react-icons/fa";

interface TaskCardProps {
  task: Task;
  assignOptions: any[];
  setEditingTask: (taskId: string | null) => void;
  setEditedTitle: (title: string) => void;
  editingTask: string | null;
  editedTitle: string;
  editingTitle: string | null;
  setEditingTitle: (taskId: string | null) => void;
  setEditedDescription: (description: string) => void;
  editedDescription: string;
  descRef: React.RefObject<HTMLTextAreaElement>;
  handleBlurTitle: (taskId: string) => void;
  handleEditDescription: (taskId: string, description: string) => void;
  handleAssignChange: (taskId: string, userId: string) => void;
  handleCreatedChange: (taskId: string, userId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  assignOptions,
  setEditingTask,
  editingTask,
  setEditedTitle,
  editedTitle,
  editingTitle,
  setEditingTitle,
  setEditedDescription,
  editedDescription,
  descRef,
  handleBlurTitle,
  handleEditDescription,
  handleAssignChange,
  handleCreatedChange,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-200">
      <div className="inline-block text-sm font-semibold text-blue-500 mb-2 uppercase tracking-wide border-2 border-blue-500 rounded-full py-1 px-2 transition-colors duration-300 hover:bg-blue-500 hover:text-white">
        {task.taskCode}
      </div>

      {editingTitle === task.id ? (
        <div className="mt-4">
          <input
            type="text"
            className="mt-1 w-full bg-gray-50 text-gray-800 border border-gray-300 rounded-md py-2 px-3 focus:outline-none"
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
          <div className="text-[10px] text-neutral-200 bg-gray-950 px-2 py-1 rounded inline-flex items-center mt-1">
            <FaInfoCircle className="mr-1" />
            Press <span className="font-bold mx-1">Enter</span> or{" "}
            <span className="font-bold mx-1">click anywhere</span> to save, or{" "}
            <span className="font-bold mx-1">Esc</span> to cancel.
          </div>
        </div>
      ) : (
        <h3
          className="text-xl font-bold text-gray-900 cursor-pointer"
          onClick={() => setEditingTitle(task.id)}
        >
          {task.title}
        </h3>
      )}

      <div className="mt-2">
        <label className="text-sm font-semibold text-gray-700">Status</label>
        <select
          className="mt-1 block w-full py-2 px-3 rounded-md border border-gray-400 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={task.status}
          onChange={(e) => handleAssignChange(task.id, e.target.value)}
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
              className="mt-1 w-full bg-gray-100 text-gray-800 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-200 min-h-[200px] max-h-[500px] overflow-y-auto resize-none"
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              onBlur={() => handleEditDescription(task.id, editedDescription)}
            />
          </div>
        ) : (
          <p
            className="mt-1 text-gray-600 cursor-pointer hover:text-indigo-600 transition-all min-h-[200px] max-h-[500px] overflow-y-auto"
            onClick={() => handleEditDescription(task.id, task.description)}
          >
            {task.description || "Click to add a description..."}
          </p>
        )}
      </div>

      <div className="mt-2">
        <label className="text-sm font-semibold text-gray-700">Assign To</label>
        <select
          className="mt-1 block w-full py-2 px-3 rounded-md border border-gray-400 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={task.teamId || ""}
          onChange={(e) => handleAssignChange(task.id, e.target.value)}
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
  );
};

export default TaskCard;
