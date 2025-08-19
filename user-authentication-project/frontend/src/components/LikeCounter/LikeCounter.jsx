import { useState, useEffect } from "react";
import { BsFillHandThumbsUpFill } from "react-icons/bs";
import styles from "./LikeCounter.module.css";

export default function LikeCounter({ episodeId }) {
  const [count, setCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  // Load like count when component mounts
  useEffect(() => {
    if (episodeId === undefined || episodeId === null) return;

    const fetchLikes = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/episodes/like.php?episode_id=${episodeId}`,
          {
            method: "GET",
            credentials: "include", // include cookies/session
          }
        );

        const result = await response.json();
        if (result.success) {
          setCount(result.likeCount);
          setHasLiked(result.hasLiked);
        }
      } catch (error) {
        console.error("Error fetching likes:", error);
      }
    };

    fetchLikes();
  }, [episodeId]);

  const toggleLike = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/episodes/like.php",
        {
          method: hasLiked ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ episode_id: episodeId }),
        }
      );

      const result = await response.json();
      if (result.success) {
        setCount(result.likeCount);
        setHasLiked(result.hasLiked);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  return (
    <div className={styles.likeCounter}>
      <button
        onClick={toggleLike}
        aria-label={
          hasLiked ? `Unlike episode ${episodeId}` : `Like episode ${episodeId}`
        }
      >
        <BsFillHandThumbsUpFill
          size={24}
          className={`${styles.icon} ${hasLiked ? styles.liked : ""}`}
        />
      </button>
      <span className={styles.likeCount}>{count}</span>
    </div>
  );
}
