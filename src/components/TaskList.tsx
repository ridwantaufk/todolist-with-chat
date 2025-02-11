import "../styles/tailwind.css";

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
  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-3xl font-semibold text-center text-indigo-600 mb-8">
        {role} Tasks
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white p-6 rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:bg-gray-50"
            >
              <h3 className="text-xl font-bold text-gray-800">{task.title}</h3>
              <p className="text-sm text-gray-500 mt-2">
                Status: {task.status}
              </p>
              {task.description && (
                <p className="mt-4 text-gray-600">{task.description}</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-center col-span-3 text-gray-500 mt-4">
            No tasks assigned.
          </p>
        )}
      </div>
    </div>
  );
}
