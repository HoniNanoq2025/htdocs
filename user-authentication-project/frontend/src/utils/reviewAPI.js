// frontend/src/utils/reviewAPI.js - API utilities for episode reviews

const API_BASE_URL = "http://localhost:8000/api/episodes";

/**
 * Get reviews data for an episode
 * @param {string|number} episodeId - The episode ID
 * @returns {Promise<Object>} Review data including average rating and user's rating
 */
export async function getReviewsForEpisode(episodeId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/review.php?episode_id=${episodeId}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        ...data.data,
      };
    } else {
      throw new Error(data.message || "Failed to get reviews");
    }
  } catch (error) {
    console.error("Error getting reviews:", error);
    return {
      success: false,
      error: error.message,
      episode_id: episodeId,
      total_reviews: 0,
      average_rating: 0,
      user_rating: null,
      rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }
}

/**
 * Submit or update a review for an episode
 * @param {string|number} episodeId - The episode ID
 * @param {number} rating - Rating from 1-5
 * @returns {Promise<Object>} Updated review data
 */
export async function submitReviewForEpisode(episodeId, rating) {
  try {
    const response = await fetch(`${API_BASE_URL}/review.php`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        episode_id: episodeId,
        rating: rating,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        ...data.data,
      };
    } else {
      throw new Error(data.message || "Failed to submit review");
    }
  } catch (error) {
    console.error("Error submitting review:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Delete a review for an episode
 * @param {string|number} episodeId - The episode ID
 * @returns {Promise<Object>} Success status
 */
export async function deleteReviewForEpisode(episodeId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/review.php?episode_id=${episodeId}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting review:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Format the average rating for display
 * @param {number} rating - The average rating
 * @returns {string} Formatted rating string
 */
export function formatAverageRating(rating) {
  if (!rating || rating === 0) {
    return "0.0";
  }
  return rating.toFixed(1);
}

/**
 * Get the rating distribution as percentages
 * @param {Object} distribution - Rating distribution object
 * @param {number} total - Total number of reviews
 * @returns {Object} Distribution as percentages
 */
export function getRatingDistributionPercentages(distribution, total) {
  if (!distribution || total === 0) {
    return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  }

  const percentages = {};
  for (let i = 1; i <= 5; i++) {
    percentages[i.toString()] = Math.round(
      (distribution[i.toString()] / total) * 100
    );
  }

  return percentages;
}
