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

  useEffect(() => {
    async function fetchFavorites() {
      const favs = await getFavoritesFromBackend();
      console.log("Favorites from backend:", favs); // 👀 check keys here
      setFavorites(favs || []);
      setLoading(false);
    }

    async function fetchEpisodes() {
      const res = await fetch("/api/episodes.json");
      const data = await res.json();
      console.log("Episodes JSON:", data.slice(0, 3)); // just preview
      setEpisodes(data);
    }

    fetchFavorites();
    fetchEpisodes();
  }, []);

  const handleToggle = async (episodeId) => {
    const result = await toggleFavoriteOnBackend(episodeId);
    if (result.success) {
      const favs = await getFavoritesFromBackend();
      setFavorites(favs || []);
    }
  };

  const getEpisodeData = (episodeId) =>
    episodes.find((ep) => ep.Id === Number(episodeId));

  if (loading) return <p className={styles.message}>Loading favorites...</p>;
  if (!favorites || favorites.length === 0) {
    return <p className={styles.message}>No favorites yet.</p>;
  }

  return (
    <div className={styles.favorites}>
      <h3 className={styles.heading}>User Favorites</h3>
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
                />
              )}
              <span className={styles.title}>
                {episode?.Title || `Episode #${episodeId}`}
              </span>
              <button
                onClick={() => handleToggle(episodeId)}
                className={styles.heartButton}
                aria-label="Toggle Favorite"
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
