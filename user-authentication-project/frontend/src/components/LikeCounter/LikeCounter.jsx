import { useState, useEffect } from "react";
import { BsFillHandThumbsUpFill } from "react-icons/bs";
import {
  getLikeCountForEpisode,
  updateLikeCountForEpisode,
} from "../../utils/localStorage";
import styles from "./LikeCounter.module.css";

export default function LikeCounter({ episodeId, initialLikes = 0 }) {
  const [count, setCount] = useState(initialLikes);

  // Load like count from localStorage when component mounts
  useEffect(() => {
    if (episodeId) {
      const savedCount = getLikeCountForEpisode(episodeId);
      setCount(savedCount > 0 ? savedCount : initialLikes);
    }
  }, [episodeId, initialLikes]);

  const increment = () => {
    const newCount = count + 1;
    setCount(newCount);

    // Save to localStorage if episodeId is provided
    if (episodeId) {
      updateLikeCountForEpisode(episodeId, newCount);
    }
  };

  return (
    <div className={styles.likeCounter}>
      <button
        onClick={increment}
        aria-label={`Like episode ${episodeId || ""}`}
      >
        <BsFillHandThumbsUpFill size={24} className={styles.icon} />
      </button>
      <span className={styles.likeCount}>{count}</span>
    </div>
  );
}
