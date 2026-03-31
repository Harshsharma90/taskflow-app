import { useState, useEffect } from "react";
import { fetchReviews, addReply } from "../services/reviewService";
import "./AdminReviewsPanel.css";

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

export default function AdminReviewsPanel({ onClose }) {
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

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleReply = async (reviewId) => {
    const text = replyText[reviewId]?.trim();
    if (!text) return;
    setSending((s) => ({ ...s, [reviewId]: true }));
    try {
      await addReply(reviewId, text);
      setReplyText((r) => ({ ...r, [reviewId]: "" }));
      await load();
    } catch {
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
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;
  const pending = reviews.filter((r) => !r.replies?.length).length;

  return (
    <div className="ap-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ap-panel">

        {/* Header */}
        <div className="ap-header">
          <div>
            <h2 className="ap-title">Reviews</h2>
            <p className="ap-sub">Manage and respond to user feedback</p>
          </div>
          <div className="ap-header-right">
            <button className="ap-refresh" onClick={load}>↻</button>
            <button className="ap-close" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Stats */}
        <div className="ap-stats">
          <div className="ap-stat">
            <span className="ap-stat-num">{reviews.length}</span>
            <span className="ap-stat-label">Total</span>
          </div>
          <div className="ap-stat">
            <span className="ap-stat-num">{avgRating}</span>
            <span className="ap-stat-label">Avg Rating</span>
          </div>
          <div className="ap-stat accent">
            <span className="ap-stat-num">{pending}</span>
            <span className="ap-stat-label">Pending</span>
          </div>
        </div>

        {/* Controls */}
        <div className="ap-controls">
          <div className="ap-filter-tabs">
            {["all", "pending", "replied"].map((f) => (
              <button key={f} className={`ap-filter-tab ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <select className="ap-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest">Highest rated</option>
            <option value="lowest">Lowest rated</option>
          </select>
        </div>

        {/* List */}
        <div className="ap-list">
          {loading ? (
            [1, 2, 3].map((i) => <div key={i} className="ap-skeleton" />)
          ) : processed.length === 0 ? (
            <p className="ap-empty">No reviews found.</p>
          ) : (
            processed.map((review) => (
              <div className={`ap-card ${!review.replies?.length ? "pending" : ""}`} key={review.id}>
                <div className="ap-card-head">
                  <div className="ap-avatar">{(review.name?.[0] || "A").toUpperCase()}</div>
                  <div className="ap-meta">
                    <span className="ap-name">{review.name || "Anonymous"}</span>
                    <span className="ap-time">{timeAgo(review.createdAt)}</span>
                  </div>
                  <StarDisplay value={review.rating} />
                  {!review.replies?.length && <span className="ap-pending-badge">Needs reply</span>}
                </div>

                <p className="ap-review-text">{review.description}</p>

                {review.replies?.length > 0 && (
                  <div className="ap-replies">
                    {review.replies.map((rep, i) => (
                      <div className="ap-reply" key={i}>
                        <span className="ap-reply-label">Your reply</span>
                        <p>{rep.text}</p>
                        <span className="ap-reply-time">{timeAgo(rep.repliedAt)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="ap-reply-box">
                  <textarea className="ap-reply-input" rows={2} placeholder="Write a reply…"
                    value={replyText[review.id] || ""}
                    onChange={(e) => setReplyText((r) => ({ ...r, [review.id]: e.target.value }))} />
                  <button className="ap-reply-send"
                    onClick={() => handleReply(review.id)}
                    disabled={sending[review.id] || !replyText[review.id]?.trim()}>
                    {sending[review.id] ? "…" : "Send"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}