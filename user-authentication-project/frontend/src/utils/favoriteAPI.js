// user-authentication-project/frontend/src/utils/favoriteAPI.js
// Utility functions for managing favorite episodes with backend API
const API_BASE_URL = "http://localhost:8000/api/episodes";

export async function getFavoritesFromBackend() {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites.php`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to fetch favorites");
    return await response.json();
  } catch (err) {
    console.error("Error fetching favorites:", err);
    return [];
  }
}

export async function toggleFavoriteOnBackend(episodeId) {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ episodeId }),
    });
    if (!response.ok) throw new Error("Failed to toggle favorite");
    return await response.json();
  } catch (err) {
    console.error("Error toggling favorite:", err);
    return { success: false };
  }
}
