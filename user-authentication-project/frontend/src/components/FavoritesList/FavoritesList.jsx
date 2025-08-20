import React, { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa6";
import {
  getFavoritesFromBackend,
  toggleFavoriteOnBackend,
} from "../../utils/favoriteAPI";
import styles from "./FavoritesList.module.css";

const FavoritesList = () => {
  const [favorites, setFavorites] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch episodes first
        const episodesRes = await fetch("/api/episodes.json");
        if (episodesRes.ok) {
          const episodesData = await episodesRes.json();
          console.log("Episodes loaded:", episodesData.length);
          setEpisodes(episodesData);
        } else {
          console.error("Failed to fetch episodes");
        }

        // Fetch favorites
        const favs = await getFavoritesFromBackend();
        console.log("Favorites from backend:", favs);
        setFavorites(Array.isArray(favs) ? favs : []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load favorites");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleToggle = async (episodeId) => {
    try {
      setError(null); // Clear any previous errors

      console.log("Attempting to toggle favorite for episode:", episodeId);
      const result = await toggleFavoriteOnBackend(episodeId);

      console.log("Toggle result:", result);

      if (result.success) {
        // Refresh favorites list from backend
        const updatedFavs = await getFavoritesFromBackend();
        setFavorites(Array.isArray(updatedFavs) ? updatedFavs : []);
      } else {
        console.error("Toggle failed:", result.error || "Unknown error");
        setError(result.error || "Failed to update favorite");
      }
    } catch (err) {
      console.error("Error in handleToggle:", err);
      setError("Failed to update favorite");
    }
  };

  const getEpisodeData = (episodeId) => {
    // Ensure we're comparing the right types
    const numericId = Number(episodeId);
    return episodes.find((ep) => ep.Id === numericId);
  };

  if (loading) return <p className={styles.message}>Loading favorites...</p>;

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className={styles.retryButton}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return <p className={styles.message}>No favorites yet.</p>;
  }

  return (
    <div className={styles.favorites}>
      <h3 className={styles.heading}>User Favorites ({favorites.length})</h3>
      <ul className={styles.list}>
        {favorites.map((episodeId) => {
          const episode = getEpisodeData(episodeId);
          return (
            <li key={episodeId} className={styles.listItem}>
              {episode?.Image && (
                <img
                  src={episode.Image}
                  alt={episode.Title}
                  className={styles.thumbnail}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
              <span className={styles.title}>
                {episode?.Title || `Episode #${episodeId}`}
                {episode?.Series && episode?.Episode && (
                  <small className={styles.episodeInfo}>
                    {episode.Episode}
                  </small>
                )}
              </span>
              <button
                onClick={() => handleToggle(episodeId)}
                className={styles.heartButton}
                aria-label="Remove from Favorites"
                title="Remove from favorites"
              >
                <FaHeart size={20} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default FavoritesList;
