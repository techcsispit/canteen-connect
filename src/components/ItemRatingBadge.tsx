import type { Review } from "../lib/ratings";
import { computeItemRatingStats } from "../lib/ratings";

interface Props {
  itemId: number;
  reviews: Review[];
  onOpenReviewModal?: () => void;
  canReview?: boolean;
}

export default function ItemRatingBadge({
  itemId,
  reviews,
  onOpenReviewModal,
  canReview = true,
}: Props) {
  const stats = computeItemRatingStats(itemId, reviews);

  return (
    <div className="item-rating-badge-container">
      {stats.totalReviews > 0 ? (
        <div className="rating-pill">
          <span className="star-icon">★</span>
          <strong>{stats.averageRating.toFixed(1)}</strong>
          <span className="reviews-count">({stats.totalReviews})</span>
        </div>
      ) : (
        <span className="rating-new-tag">New</span>
      )}

      {canReview && onOpenReviewModal && (
        <button
          type="button"
          className="rate-item-link"
          onClick={(e) => {
            e.stopPropagation();
            onOpenReviewModal();
          }}
          title="Review this item"
        >
          Rate
        </button>
      )}
    </div>
  );
}
