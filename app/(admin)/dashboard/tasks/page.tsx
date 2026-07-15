import { tasks } from "./_components/data";
import { TasksPageContent } from "./_components/tasks-page-content";

export default function Page() {
  return <TasksPageContent data={tasks} />;
}
