export interface Task {
  id: string;
  title: string;
  status: string;
  description: string;
  leadId: string;
  teamId: string;
  taskCode: string;
}

export interface TaskListProps {
  tasks: Task[];
  role: "Lead" | "Team";
}
