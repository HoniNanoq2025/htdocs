// user-authentication-project/frontend/src/utils/favoriteAPI.js
// Enhanced debugging version to identify the exact issue
const API_BASE_URL = "http://localhost:8000/api";

export async function getFavoritesFromBackend() {
  try {
    console.log(
      "🔍 Fetching favorites from:",
      `${API_BASE_URL}/episodes/favorites`
    );

    const response = await fetch(`${API_BASE_URL}/episodes/favorites`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    console.log("📡 Favorites response status:", response.status);
    console.log(
      "📡 Favorites response headers:",
      Object.fromEntries(response.headers)
    );

    const text = await response.text();
    console.log("📄 Raw favorites response:", text);

    if (!response.ok) {
      console.error(
        `❌ Failed to fetch favorites: ${response.status} ${response.statusText}`
      );
      console.error("Response body:", text);
      return [];
    }

    try {
      const parsed = JSON.parse(text);
      console.log("✅ Parsed favorites:", parsed);
      return parsed;
    } catch (parseError) {
      console.error("❌ Failed to parse favorites JSON:", parseError);
      console.error("Response text:", text);
      return [];
    }
  } catch (err) {
    console.error("❌ Network error fetching favorites:", err);
    return [];
  }
}

export async function toggleFavoriteOnBackend(episodeId) {
  try {
    const url = `${API_BASE_URL}/episodes/favorites`;
    const payload = { episodeId };

    console.log("🔄 Toggling favorite:");
    console.log("  URL:", url);
    console.log("  Payload:", payload);
    console.log("  Episode ID type:", typeof episodeId, episodeId);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    console.log("📡 Toggle response status:", response.status);
    console.log(
      "📡 Toggle response headers:",
      Object.fromEntries(response.headers)
    );

    const text = await response.text();
    console.log("📄 Raw toggle response:", text);

    if (!response.ok) {
      console.error(
        `❌ Failed to toggle favorite: ${response.status} ${response.statusText}`
      );
      console.error("Response body:", text);

      // Try to parse error response
      try {
        const errorData = JSON.parse(text);
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}`,
        };
      } catch (e) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${text.substring(0, 100)}...`,
        };
      }
    }

    try {
      const result = JSON.parse(text);
      console.log("✅ Parsed toggle result:", result);
      return result;
    } catch (parseError) {
      console.error("❌ Failed to parse toggle response JSON:", parseError);
      console.error("Response text:", text);
      return { success: false, error: "Invalid JSON response" };
    }
  } catch (err) {
    console.error("❌ Network error toggling favorite:", err);
    return { success: false, error: "Network error: " + err.message };
  }
}
