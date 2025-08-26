import styles from "./EpisodeCard.module.css";
import { useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa6";
import EpisodeReview from "../EpisodeReview/EpisodeReview";
import LikeCounter from "../LikeCounter/LikeCounter";

// EpisodeCard komponent med props: episode, favorites, toggleFavorites fra parent komponent
export default function EpisodeCard({ episode, favorites, toggleFavorites }) {
  const navigate = useNavigate(); // Hook til navigation

  // Render EpisodeCard med episode data og interaktive elementer
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <div
          className={styles.image}
          style={{
            backgroundImage: `url(${episode.Image})`, // Dynamisk baggrundsbillede
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
          role="img" // Rolle for tilgængelighed
          aria-label={`${episode.Title} episode thumbnail`} // Tilgængelighedslabel
        />
        {/* Read more-knap -> læs mere om episode */}
        <button
          className={styles.readMoreBtn}
          aria-label="Click to read more about this episode"
          onClick={() => navigate(`/episodes/${episode.Id}`)} // Naviger til episode detaljer
        >
          Read more
        </button>
      </div>
      <div className={styles.redContainer}>
        <div className={styles.likesContainer}>
          {/* Favorit knap */}
          <button
            aria-label={
              favorites.includes(episode.Id)
                ? "Remove from favorites"
                : "Add to favorites"
            } // Tilgængelighedslabel
            onClick={() => toggleFavorites(episode.Id)} // Toggle favorit status
            className={styles.favoriteButton}
          >
            <FaHeart
              size={24}
              style={{
                color: favorites.includes(episode.Id)
                  ? "var(--lightblue)"
                  : "var(--light)",
                transition: "color 0.2s",
              }} // Dynamisk farve baseret på favorit status
            />
          </button>
          {/* Like counter with episode ID */}
          <LikeCounter episodeId={episode.Id} initialLikes={0} />
        </div>
        <div className={styles.reviewContainer}>
          <p>Review</p>
          <EpisodeReview episodeId={episode.Id} />
        </div>
      </div>
      <div className={styles.episodeDescription}>
        <h3 className={styles.episodeTitle}>{episode.Title}</h3>
        <details className={styles.episodeDetails}>
          <summary className={styles.episodeSummary}>
            Click to read episode summary.
          </summary>
          <p className={styles.episodeTxt}>{episode.Summary}</p>
        </details>
      </div>
      <div className={styles.iFrameContainer}>
        <iframe
          src={episode.iFrameLink}
          frameBorder="0"
          width="100%"
          height="100px"
        ></iframe>
      </div>
    </div>
  );
}
