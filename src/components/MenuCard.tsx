import type { MenuItem } from "../lib/menu";
import { getDietaryTags, DIETARY_CONFIG } from "../lib/dietary";
import ItemRatingBadge from "./ItemRatingBadge";
import type { Review } from "../lib/ratings";

interface Props {
  item: MenuItem;
  qty: number;
  onAdd: () => void;
  onChange: (delta: number) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  reviews?: Review[];
  onOpenReviewModal?: () => void;
}

export default function MenuCard({
  item,
  qty,
  onAdd,
  onChange,
  isFavorite = false,
  onToggleFavorite,
  reviews = [],
  onOpenReviewModal,
}: Props) {
  const dietaryTags = getDietaryTags(item.id);

  return (
    <article className={item.available ? "card" : "card sold-out"}>
      <div className="card-top-actions">
        {onToggleFavorite && (
          <button
            type="button"
            className={`fav-btn ${isFavorite ? "fav-btn-active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            aria-label={isFavorite ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
            title={isFavorite ? "Favorited" : "Add to favorites"}
          >
            {isFavorite ? "❤️" : "🤍"}
          </button>
        )}
      </div>

      <div className="card-emoji" aria-hidden="true">{item.emoji}</div>
      <div className="card-body">
        <div className="card-title-row">
          <h3>
            <span className={item.veg ? "dot veg" : "dot non-veg"} title={item.veg ? "Veg" : "Non-veg"} />
            {item.name}
          </h3>
          <ItemRatingBadge
            itemId={item.id}
            reviews={reviews}
            onOpenReviewModal={onOpenReviewModal}
          />
        </div>

        <p>{item.description}</p>

        {dietaryTags.length > 0 && (
          <div className="dietary-badges-row" aria-label="Dietary information">
            {dietaryTags.map((tag) => (
              <span key={tag} className="dietary-badge" title={DIETARY_CONFIG[tag].description}>
                {DIETARY_CONFIG[tag].badge}
              </span>
            ))}
          </div>
        )}

        <div className="card-footer">
          <strong>₹{item.price}</strong>
          {!item.available ? (
            <span className="muted">Sold out</span>
          ) : qty === 0 ? (
            <button onClick={onAdd}>Add</button>
          ) : (
            <div className="stepper">
              <button onClick={() => onChange(-1)} aria-label={`Remove one ${item.name}`}>−</button>
              <span>{qty}</span>
              <button onClick={() => onChange(1)} aria-label={`Add one ${item.name}`}>+</button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
