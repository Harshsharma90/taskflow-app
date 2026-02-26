export default function Overview({ tasks }) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.done).length;
  const pending = total - completed;
  const progress = total ? (completed / total) * 100 : 0;

  return (
    <div className="overview">
      <h3>Overview</h3>

      <div className="statsGrid">
        <div className="statCard">
          <p>Total</p>
          <h2>{total}</h2>
        </div>

        <div className="statCard">
          <p>Pending</p>
          <h2>{pending}</h2>
        </div>

        <div className="statCard">
          <p>Done</p>
          <h2>{completed}</h2>
        </div>
      </div>

      <div className="progressBox">
        <div className="progressText">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>

        <div className="progress">
          <div style={{ width: progress + "%" }} />
        </div>
      </div>
    </div>
  );
}