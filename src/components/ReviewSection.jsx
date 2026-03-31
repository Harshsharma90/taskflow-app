import { useState, useEffect } from "react";
import { addReview, fetchReviews } from "../services/reviewService";
import "./ReviewSection.css";

const StarRating = ({ value, onChange, readOnly = false }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="stars" aria-label={`Rating: ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star ${star <= (hovered || value) ? "active" : ""}`}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          disabled={readOnly}
          aria-label={`${star} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

export default function ReviewSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", rating: 0 });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const loadReviews = async () => {
    try {
      const data = await fetchReviews();
      setReviews(data);
    } catch (e) {
      console.error("Failed to load reviews:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReviews(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.description.trim()) return setError("Please write a review.");
    if (form.rating === 0) return setError("Please select a star rating.");
    setSubmitting(true);
    try {
      await addReview(form);
      setForm({ name: "", description: "", rating: 0 });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      loadReviews();
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <section className="review-section">
      <div className="review-header">
        <h2 className="review-title">What people are saying</h2>
        {avgRating && (
          <div className="avg-badge">
            <span className="avg-number">{avgRating}</span>
            <StarRating value={Math.round(avgRating)} readOnly />
            <span className="review-count">
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      <form className="review-form" onSubmit={handleSubmit}>
        <h3 className="form-title">Leave a Review</h3>
        <div className="form-row">
          <input
            className="form-input"
            type="text"
            placeholder="Your name (optional)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            maxLength={60}
          />
        </div>
        <div className="form-row rating-row">
          <span className="rating-label">Your rating</span>
          <StarRating value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
        </div>
        <div className="form-row">
          <textarea
            className="form-input form-textarea"
            placeholder="Share your experience…"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            maxLength={600}
            required
          />
          <span className="char-count">{form.description.length}/600</span>
        </div>
        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">✓ Thanks! Your review was submitted.</p>}
        <button className="submit-btn" type="submit" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit Review"}
        </button>
      </form>

      <div className="review-list">
        {loading ? (
          <div className="review-loading">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton-card" />)}
          </div>
        ) : reviews.length === 0 ? (
          <p className="no-reviews">Be the first to leave a review!</p>
        ) : (
          reviews.map((review) => (
            <div className="review-card" key={review.id}>
              <div className="review-card-top">
                <div className="reviewer-avatar">
                  {(review.name?.[0] || "A").toUpperCase()}
                </div>
                <div className="reviewer-info">
                  <span className="reviewer-name">{review.name || "Anonymous"}</span>
                  <span className="review-time">{timeAgo(review.createdAt)}</span>
                </div>
                <StarRating value={review.rating} readOnly />
              </div>
              <p className="review-body">{review.description}</p>
              {review.replies?.length > 0 && (
                <div className="replies">
                  {review.replies.map((reply, i) => (
                    <div className="reply" key={i}>
                      <span className="reply-badge">Reply from team</span>
                      <p className="reply-text">{reply.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}