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
    <div>
      <h2>{role} Tasks</h2>
      <ul>
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <li key={task.id}>
              <h3>{task.title}</h3>
              <p>Status: {task.status}</p>
              {task.description && <p>Description: {task.description}</p>}
            </li>
          ))
        ) : (
          <p>No tasks assigned.</p>
        )}
      </ul>
    </div>
  );
}
