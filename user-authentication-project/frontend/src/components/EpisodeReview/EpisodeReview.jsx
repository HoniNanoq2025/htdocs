import { useState, useEffect } from "react";
import { IoIosStarOutline, IoIosStar } from "react-icons/io";
import {
  getReviewsForEpisode,
  updateReviewForEpisode,
} from "../../utils/localStorage";

export default function EpisodeReview({ episodeId, starColor = "white" }) {
  const [rating, setRating] = useState(0);

  // Load rating from localStorage when episodeId changes
  useEffect(() => {
    const savedRating = getReviewsForEpisode(episodeId) || 0; // Default to 0 if no review exists
    setRating(savedRating);
  }, [episodeId]); // This dependency ensures the rating resets when episodeId changes

  // Handle star click and save to localStorage
  const handleStarClick = (starValue) => {
    setRating(starValue);
    updateReviewForEpisode(episodeId, starValue);
  };

  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((star) =>
        rating >= star ? (
          <IoIosStar
            key={star}
            size={24}
            style={{ color: starColor, cursor: "pointer" }}
            onClick={() => handleStarClick(star)}
            aria-label={`Set review to ${star} stars`}
          />
        ) : (
          <IoIosStarOutline
            key={star}
            size={24}
            style={{ color: starColor, cursor: "pointer" }}
            onClick={() => handleStarClick(star)}
            aria-label={`Set review to ${star} stars`}
          />
        )
      )}
    </div>
  );
}
