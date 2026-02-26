export default function Filters({ filter, setFilter }) {
  return (
    <div className="filters">
      <button
  className={filter === "all" ? "activeFilter" : ""}
  onClick={() => setFilter("all")}
>
  All
</button>

<button
  className={filter === "active" ? "activeFilter" : ""}
  onClick={() => setFilter("active")}
>
  Active
</button>

<button
  className={filter === "completed" ? "activeFilter" : ""}
  onClick={() => setFilter("completed")}
>
  Completed
</button>
    </div>
  );
}