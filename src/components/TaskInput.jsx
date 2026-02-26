import { useState } from "react";

export default function TaskInput({ addTask }) {
  const [text, setText] = useState("");

  return (
    <div className="inputRow">
      <input
        placeholder="What needs to be done?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={() => {
          addTask(text);
          setText("");
        }}
      >
        Add
      </button>
    </div>
  );
}