import { useState } from "react";

export default function TaskItem({ task, toggleTask, deleteTask, editTask }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(task.text);

  const handleSave = () => {
    if (!value.trim()) return;
    editTask(task.id, value);
    setEditing(false);
  };

  const now = new Date();

  // Convert Firestore timestamp safely
  const reminderDate = task.reminder
    ? new Date(
        task.reminder.seconds
          ? task.reminder.seconds * 1000
          : task.reminder
      )
    : null;

  const isOverdue =
    reminderDate && !task.done && reminderDate < now;

  const isToday =
    reminderDate &&
    reminderDate.toDateString() === now.toDateString();

  return (
    <div className={`task ${isOverdue ? "taskOverdue" : ""}`}>
      <div className="taskLeft">
        <input
          type="checkbox"
          checked={task.done}
          onChange={() => toggleTask(task.id, task.done)}
        />

        <div className="taskTextArea">
          {editing ? (
            <input
              className="editInput"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          ) : (
            <>
              <span className={task.done ? "done" : ""}>
                {task.text}
              </span>

              {reminderDate && (
                <div
                  className={`reminderText ${
                    isOverdue
                      ? "overdue"
                      : isToday
                      ? "today"
                      : ""
                  }`}
                >
                  {isOverdue
                    ? "🔴 Overdue: "
                    : isToday
                    ? "🟡 Due Today: "
                    : "⏰ "}
                  {reminderDate.toLocaleString()}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="taskActions">
        {editing ? (
          <button className="editBtn" onClick={handleSave}>
            Save
          </button>
        ) : (
          <button
            className="editBtn"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
        )}

        <button
          className="deleteBtn"
          onClick={() => deleteTask(task.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}