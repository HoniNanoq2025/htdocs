// user-authentication-project/frontend/src/utils/favoriteAPI.js
// Enhanced debugging version to identify the exact issue
const API_BASE_URL = "http://localhost:8000/api";

export async function getFavoritesFromBackend() {
  try {
    console.log(
      "🔍 Fetching favorites from:",
      `${API_BASE_URL}/episodes/favorites.php`
    );

    const response = await fetch(`${API_BASE_URL}/episodes/favorites.php`, {
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
    const url = `${API_BASE_URL}/episodes/favorites.php`;
    const payload = { episodeId };

    console.log("🔄 Toggling favorite:", payload);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include", // ensures user session is sent
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    console.log("📄 Raw toggle response:", text);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = JSON.parse(text);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        errorMessage = text.substring(0, 100);
      }
      return { success: false, error: errorMessage };
    }

    // Always return a consistent object
    try {
      const data = JSON.parse(text);
      if (data && typeof data === "object" && "success" in data) {
        return { success: !!data.success, ...data };
      } else {
        // Assume success if backend didn't provide explicit "success"
        return { success: true, data };
      }
    } catch (parseError) {
      console.error("❌ Failed to parse toggle response JSON:", parseError);
      return { success: false, error: "Invalid JSON response from server" };
    }
  } catch (err) {
    console.error("❌ Network error toggling favorite:", err);
    return { success: false, error: "Network error: " + err.message };
  }
}
