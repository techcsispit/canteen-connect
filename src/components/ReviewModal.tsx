import { useState } from "react";
import type { Review } from "../lib/ratings";
import { PRESET_REVIEW_TAGS } from "../lib/ratings";

interface Props {
  itemId: number;
  itemName: string;
  itemEmoji: string;
  userEmail: string;
  onClose: () => void;
  onSubmit: (review: { itemId: number; userEmail: string; rating: number; tags: string[]; comment: string }) => void;
}

export default function ReviewModal({
  itemId,
  itemName,
  itemEmoji,
  userEmail,
  onClose,
  onSubmit,
}: Props) {
  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5 stars.");
      return;
    }
    onSubmit({
      itemId,
      userEmail,
      rating,
      tags: selectedTags,
      comment: comment.trim(),
    });
    onClose();
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="review-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="review-modal-header">
          <div className="review-item-intro">
            <span className="review-item-emoji">{itemEmoji}</span>
            <div>
              <h3>Rate & Review</h3>
              <p className="muted">{itemName}</p>
            </div>
          </div>
          <button className="close" onClick={onClose} aria-label="Close review dialog">
            ×
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="review-form">
          <div className="rating-select-group">
            <label>Your Rating</label>
            <div className="star-rating-row" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={`star-btn ${rating >= star ? "star-active" : ""}`}
                  onClick={() => setRating(star)}
                  aria-label={`${star} star${star > 1 ? "s" : ""}`}
                >
                  ★
                </button>
              ))}
              <span className="rating-number-badge">{rating}.0 / 5.0</span>
            </div>
          </div>

          <div className="review-tags-group">
            <label>What stood out? (Optional)</label>
            <div className="preset-tags-wrap">
              {PRESET_REVIEW_TAGS.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    className={`tag-pill ${active ? "tag-pill-active" : ""}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {active ? "✓ " : "+ "}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="review-comment-group">
            <label htmlFor="review-comment">Student Feedback</label>
            <textarea
              id="review-comment"
              rows={3}
              placeholder="How was the taste, portion, and warmth? Help fellow students decide!"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={250}
            />
            <small className="muted text-right">{comment.length}/250 characters</small>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <div className="review-modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
