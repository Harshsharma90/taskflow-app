import TaskItem from "./TaskItem";

export default function TaskList(props) {
  return (
    <div>
      {props.tasks.map((task) => (
        <TaskItem key={task.id} {...props} task={task} />
      ))}
    </div>
  );
}