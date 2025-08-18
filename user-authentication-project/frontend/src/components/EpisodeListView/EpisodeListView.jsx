import styles from "./EpisodeListView.module.css";
import EpisodeCard from "../EpisodeCard/EpisodeCard";

export default function EpisodeListView({
  episodes,
  favorites,
  toggleFavorites,
}) {
  if (!episodes || episodes.length === 0) {
    return <p>No Episodes found</p>;
  }

  return (
    <ul className={styles.episodeList}>
      {episodes.map((episode) => {
        const isFavorite = favorites.includes(episode.Id);
        return (
          <li key={episode.Id} className={styles.episodeListItem}>
            <EpisodeCard
              episode={episode}
              favorites={favorites}
              toggleFavorites={toggleFavorites}
            />
          </li>
        );
      })}
    </ul>
  );
}
