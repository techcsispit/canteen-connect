import type { DietaryTag } from "../lib/dietary";
import { ALL_DIETARY_TAGS, DIETARY_CONFIG } from "../lib/dietary";

interface Props {
  selectedTags: DietaryTag[];
  onToggleTag: (tag: DietaryTag) => void;
  favoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  favoritesCount: number;
}

export default function DietaryFilterBar({
  selectedTags,
  onToggleTag,
  favoritesOnly,
  onToggleFavoritesOnly,
  favoritesCount,
}: Props) {
  return (
    <div className="dietary-filter-bar" aria-label="Dietary & preference filters">
      <div className="dietary-chips-row">
        <button
          type="button"
          className={`dietary-chip favorite-chip ${favoritesOnly ? "chip-active" : ""}`}
          onClick={onToggleFavoritesOnly}
          aria-pressed={favoritesOnly}
        >
          <span className="chip-icon">❤️</span>
          Favorites {favoritesCount > 0 && `(${favoritesCount})`}
        </button>

        {ALL_DIETARY_TAGS.map((tag) => {
          const config = DIETARY_CONFIG[tag];
          const active = selectedTags.includes(tag);
          return (
            <button
              type="button"
              key={tag}
              className={`dietary-chip ${active ? "chip-active" : ""}`}
              onClick={() => onToggleTag(tag)}
              title={config.description}
              aria-pressed={active}
            >
              <span className="chip-icon">{config.badge.slice(0, 2)}</span>
              {config.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
