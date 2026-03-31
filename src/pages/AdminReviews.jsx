import { useState, useEffect } from "react";
import { fetchReviews, addReply } from "../services/reviewService";
import "./AdminReviews.css";

const StarDisplay = ({ value }) => (
  <span className="admin-stars">
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} className={s <= value ? "s-on" : "s-off"}>★</span>
    ))}
  </span>
);

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [sending, setSending] = useState({});
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchReviews();
      setReviews(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleReply = async (reviewId) => {
    const text = replyText[reviewId]?.trim();
    if (!text) return;
    setSending((s) => ({ ...s, [reviewId]: true }));
    try {
      await addReply(reviewId, text);
      setReplyText((r) => ({ ...r, [reviewId]: "" }));
      await load();
    } catch (e) {
      alert("Failed to send reply. Please try again.");
    } finally {
      setSending((s) => ({ ...s, [reviewId]: false }));
    }
  };

  const processed = [...reviews]
    .filter((r) => {
      if (filter === "replied") return r.replies?.length > 0;
      if (filter === "pending") return !r.replies?.length;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "highest") return b.rating - a.rating;
      if (sortBy === "lowest") return a.rating - b.rating;
      return 0;
    });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;
  const pending = reviews.filter((r) => !r.replies?.length).length;

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <div>
          <h1 className="admin-heading">Reviews</h1>
          <p className="admin-sub">Manage and respond to user feedback</p>
        </div>
        <button className="admin-refresh-btn" onClick={load}>↻ Refresh</button>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <span className="stat-num">{reviews.length}</span>
          <span className="stat-label">Total Reviews</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{avgRating}</span>
          <span className="stat-label">Avg Rating</span>
        </div>
        <div className="stat-card accent">
          <span className="stat-num">{pending}</span>
          <span className="stat-label">Awaiting Reply</span>
        </div>
      </div>

      <div className="admin-controls">
        <div className="filter-tabs">
          {["all", "pending", "replied"].map((f) => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="highest">Highest rated</option>
          <option value="lowest">Lowest rated</option>
        </select>
      </div>

      {loading ? (
        <div className="admin-loading">
          {[1, 2, 3].map((i) => <div key={i} className="admin-skeleton" />)}
        </div>
      ) : processed.length === 0 ? (
        <div className="admin-empty">No reviews found.</div>
      ) : (
        <div className="admin-list">
          {processed.map((review) => (
            <div className={`admin-card ${!review.replies?.length ? "pending" : ""}`} key={review.id}>
              <div className="admin-card-head">
                <div className="admin-avatar">{(review.name?.[0] || "A").toUpperCase()}</div>
                <div className="admin-meta">
                  <span className="admin-name">{review.name || "Anonymous"}</span>
                  <span className="admin-time">{timeAgo(review.createdAt)}</span>
                </div>
                <StarDisplay value={review.rating} />
                {!review.replies?.length && <span className="pending-badge">Needs reply</span>}
              </div>

              <p className="admin-review-text">{review.description}</p>

              {review.replies?.length > 0 && (
                <div className="admin-replies">
                  {review.replies.map((rep, i) => (
                    <div className="admin-reply" key={i}>
                      <span className="admin-reply-label">Your reply</span>
                      <p>{rep.text}</p>
                      <span className="admin-reply-time">{timeAgo(rep.repliedAt)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="reply-box">
                <textarea
                  className="reply-input"
                  rows={2}
                  placeholder="Write a reply…"
                  value={replyText[review.id] || ""}
                  onChange={(e) => setReplyText((r) => ({ ...r, [review.id]: e.target.value }))}
                />
                <button
                  className="reply-send-btn"
                  onClick={() => handleReply(review.id)}
                  disabled={sending[review.id] || !replyText[review.id]?.trim()}
                >
                  {sending[review.id] ? "Sending…" : "Send Reply"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}