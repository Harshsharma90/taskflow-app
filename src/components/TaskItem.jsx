import { useState } from "react";

export default function TaskItem({ task, toggleTask, deleteTask, editTask }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(task.text);

  const handleSave = () => {
    if (!value.trim()) return;
    editTask(task.id, value);
    setEditing(false);
  };

  return (
    <div className="task">
      <div className="taskLeft">
        <input
          type="checkbox"
          checked={task.done}
          onChange={() => toggleTask(task.id)}
        />

        {editing ? (
          <input
            className="editInput"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        ) : (
          <span className={task.done ? "done" : ""}>{task.text}</span>
        )}
      </div>

      <div className="taskActions">
        {editing ? (
          <button className="editBtn" onClick={handleSave}>
            Save
          </button>
        ) : (
          <button className="editBtn" onClick={() => setEditing(true)}>
            Edit
          </button>
        )}

        <button className="deleteBtn" onClick={() => deleteTask(task.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}