import { useState, useEffect } from "react";
import { IoIosStarOutline, IoIosStar } from "react-icons/io";
import {
  getReviewsForEpisode,
  submitReviewForEpisode,
  formatAverageRating,
} from "../../utils/reviewAPI";
import styles from "./EpisodeReview.module.css";

export default function EpisodeReview({
  episodeId,
  starColor = "white",
  showAverage = false,
  showTotalReviews = false,
}) {
  const [reviewData, setReviewData] = useState({
    total_reviews: 0,
    average_rating: 0,
    user_rating: null,
    rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Load review data when component mounts or episodeId changes
  useEffect(() => {
    loadReviewData();
  }, [episodeId]);

  const loadReviewData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReviewsForEpisode(episodeId);

      if (data.success) {
        setReviewData(data);
      } else {
        setError(data.error || "Failed to load reviews");
        // Set default data on error
        setReviewData({
          total_reviews: 0,
          average_rating: 0,
          user_rating: null,
          rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        });
      }
    } catch (err) {
      setError(err.message);
      console.error("Error loading review data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle star click and submit to backend
  const handleStarClick = async (starValue) => {
    if (submitting) return; // Prevent multiple submissions

    try {
      setSubmitting(true);
      setError(null);

      const result = await submitReviewForEpisode(episodeId, starValue);

      if (result.success) {
        // Update local state with the response from backend
        setReviewData(result);
      } else {
        setError(result.error || "Failed to submit review");
        console.error("Review submission failed:", result.error);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error submitting review:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {error && (
        <div className={styles.error} title={error}>
          ⚠️
        </div>
      )}

      {/* Star Rating Input */}
      <div className={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = reviewData.user_rating >= star;
          const StarIcon = isActive ? IoIosStar : IoIosStarOutline;

          return (
            <StarIcon
              key={star}
              size={24}
              className={`${styles.star} ${submitting ? styles.disabled : ""}`}
              style={{
                color: starColor,
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.6 : 1,
              }}
              onClick={() => !submitting && handleStarClick(star)}
              aria-label={`Set review to ${star} star${star > 1 ? "s" : ""}`}
              title={`Rate ${star} star${star > 1 ? "s" : ""}`}
            />
          );
        })}
      </div>

      {/* Average Rating Display */}
      {showAverage && reviewData.total_reviews > 0 && (
        <div className={styles.averageContainer}>
          <span className={styles.averageRating} style={{ color: starColor }}>
            {formatAverageRating(reviewData.average_rating)}
          </span>
          <div className={styles.averageStars}>
            {[1, 2, 3, 4, 5].map((star) => {
              const isActive = reviewData.average_rating >= star;
              const isHalfActive =
                !isActive && reviewData.average_rating >= star - 0.5;
              const StarIcon = isActive ? IoIosStar : IoIosStarOutline;

              return (
                <StarIcon
                  key={`avg-${star}`}
                  size={16}
                  style={{
                    color: starColor,
                    opacity: isActive ? 1 : isHalfActive ? 0.5 : 0.3,
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Total Reviews Count */}
      {showTotalReviews && (
        <div className={styles.totalReviews} style={{ color: starColor }}>
          {reviewData.total_reviews} review
          {reviewData.total_reviews !== 1 ? "s" : ""}
        </div>
      )}

      {/* Loading indicator during submission */}
      {submitting && <div className={styles.submitting}>Saving...</div>}
    </div>
  );
}
