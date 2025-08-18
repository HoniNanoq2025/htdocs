import styles from "./EpisodeCard.module.css";
import { useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa6";
import EpisodeReview from "../EpisodeReview/EpisodeReview";
import LikeCounter from "../LikeCounter/LikeCounter";

export default function EpisodeCard({ episode, favorites, toggleFavorites }) {
  const navigate = useNavigate();
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <div
          className={styles.image}
          style={{
            backgroundImage: `url(${episode.Image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
          role="img"
          aria-label={`${episode.Title} episode thumbnail`}
        />
        <button
          className={styles.readMoreBtn}
          aria-label="Click to read more about this episode"
          onClick={() => navigate(`/episodes/${episode.Id}`)}
        >
          Read more
        </button>
      </div>
      <div className={styles.redContainer}>
        <div className={styles.likesContainer}>
          <button
            aria-label={favorites.includes(episode.Id) ? "Unlike" : "Like"}
            onClick={() => toggleFavorites(episode.Id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            <FaHeart
              size={24}
              style={{
                color: favorites.includes(episode.Id)
                  ? "var(--lightblue)"
                  : "var(--light)",
                transition: "color 0.2s",
              }}
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
