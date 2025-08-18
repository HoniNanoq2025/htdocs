// Const variabel der definerer key til localStorage - bruges som identifier for vores data
const FAVORITES_KEY = "favoriteEpisodesIds";
const LIKE_COUNTS_KEY = "likeCountsIds";
const REVIEWS_KEY = "episodeReviews";

export function getFavoritesFromStorage() {
  try {
    // localStorage.getItem() returnerer string eller null - vi parser JSON til JavaScript object/array
    const favs = localStorage.getItem(FAVORITES_KEY);
    // Ternary operator: returnerer parsed JSON array eller fallback til tom array
    return favs ? JSON.parse(favs) : [];
  } catch (e) {
    // Error handling med console.error for debugging - vigtig ved localStorage fejl
    console.error("Could not fetch favorites from localStorage", e);
    // Returnerer default value (tom array) så component state ikke crasher
    return [];
  }
}

export function saveFavoritesToStorage(favorites) {
  try {
    // JSON.stringify() konverterer JavaScript array/object til string format for localStorage
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (e) {
    console.error("Could not save favorites in localStorage", e);
  }
}

export function getLikeCountsFromStorage() {
  try {
    const likeCounts = localStorage.getItem(LIKE_COUNTS_KEY);
    // Returns object like: { "1": 5, "2": 3, "10": 12 } where key is episodeId and value is like count
    return likeCounts ? JSON.parse(likeCounts) : {};
  } catch (e) {
    console.error("Could not fetch like counts from localStorage", e);
    return {};
  }
}

export function saveLikeCountsToStorage(likeCounts) {
  try {
    localStorage.setItem(LIKE_COUNTS_KEY, JSON.stringify(likeCounts));
  } catch (e) {
    console.error("Could not save like counts in localStorage", e);
  }
}

export function updateLikeCountForEpisode(episodeId, newCount) {
  try {
    const likeCounts = getLikeCountsFromStorage();
    likeCounts[episodeId] = newCount;
    saveLikeCountsToStorage(likeCounts);
    return likeCounts;
  } catch (e) {
    console.error("Could not update like count for episode", episodeId, e);
    return getLikeCountsFromStorage();
  }
}

export function getLikeCountForEpisode(episodeId) {
  try {
    const likeCounts = getLikeCountsFromStorage();
    return likeCounts[episodeId] || 0;
  } catch (e) {
    console.error("Could not fetch like count for episode", episodeId, e);
    return 0;
  }
}

export function getReviewsFromStorage() {
  try {
    const reviews = localStorage.getItem(REVIEWS_KEY);
    // Returns object like: { "1": 4, "2": 5, "10": 3 } where key is episodeId and value is review rating
    return reviews ? JSON.parse(reviews) : {};
  } catch (e) {
    console.error("Could not fetch reviews from localStorage", e);
    return {};
  }
}

export function saveReviewsToStorage(reviews) {
  try {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  } catch (e) {
    console.error("Could not save reviews in localStorage", e);
  }
}

export function getReviewsForEpisode(episodeId) {
  try {
    const reviews = getReviewsFromStorage();
    return reviews[episodeId] || 0; // Return 0 if no review exists for this episode
  } catch (e) {
    console.error("Could not fetch review for episode", episodeId, e);
    return 0;
  }
}

export function updateReviewForEpisode(episodeId, newRating) {
  try {
    const reviews = getReviewsFromStorage();
    reviews[episodeId] = newRating;
    saveReviewsToStorage(reviews);
    return reviews;
  } catch (e) {
    console.error("Could not update review for episode", episodeId, e);
    return getReviewsFromStorage();
  }
}
