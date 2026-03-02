import { useState } from "react";

export default function TaskInput({ addTask }) {
  const [text, setText] = useState("");
  const [dateTime, setDateTime] = useState("");

  const handleAdd = () => {
    if (!text.trim()) return;

    addTask(text, dateTime); // send both values
    setText("");
    setDateTime("");
  };

  return (
    <div className="inputRow">
      <input
        type="text"
        placeholder="What needs to be done?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <input
        type="datetime-local"
        value={dateTime}
        onChange={(e) => setDateTime(e.target.value)}
      />

      <button onClick={handleAdd}>
        Add
      </button>
    </div>
  );
}