export async function getFavoritesFromBackend() {
  try {
    const response = await fetch("/backend/api/episodes/favorites.php");
    if (!response.ok) throw new Error("Failed to fetch favorites");
    return await response.json();
  } catch (err) {
    console.error("Error fetching favorites:", err);
    return [];
  }
}

export async function toggleFavoriteOnBackend(episodeId) {
  try {
    const response = await fetch("/backend/api/episodes/favorites.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ episodeId }),
    });

    if (!response.ok) throw new Error("Failed to toggle favorite");
    return true;
  } catch (err) {
    console.error("Error toggling favorite:", err);
    return false;
  }
}
