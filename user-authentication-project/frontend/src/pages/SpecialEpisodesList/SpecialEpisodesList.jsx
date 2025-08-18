import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import EpisodeCard from "../../components/EpisodeCard/EpisodeCard";
import styles from "./SpecialEpisodesList.module.css";

export default function SpecialEpisodesList({ favorites, toggleFavorites }) {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Decode the category name from the URL
  const decodedCategoryName = decodeURIComponent(categoryName);

  useEffect(() => {
    document.title = `${decodedCategoryName} Episodes - ReCall The Midwife`;
  }, [decodedCategoryName]);

  useEffect(() => {
    const fetchCategoryEpisodes = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/episodes.json");

        if (!response.ok) {
          throw new Error("Failed to fetch episodes data");
        }

        const allEpisodes = await response.json();

        // Filter for episodes that are Special and match the category
        const filteredEpisodes = allEpisodes.filter(
          (episode) =>
            episode.Special === true &&
            episode["Type special"] === decodedCategoryName
        );

        // Sort by ID (or you could sort by date)
        const sortedEpisodes = filteredEpisodes.sort((a, b) => a.Id - b.Id);

        setEpisodes(sortedEpisodes);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching category episodes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryEpisodes();
  }, [decodedCategoryName]);

  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return (
      <main className={styles.specialEpisodesMain}>
        <div className={styles.loadingContainer}>
          <p>Loading {decodedCategoryName} episodes...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.specialEpisodesMain}>
        <div className={styles.errorContainer}>
          <h1>Error Loading Episodes</h1>
          <p>{error}</p>
          <button onClick={handleBackClick} className={styles.backButton}>
            <FaArrowLeft /> Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.specialEpisodesMain}>
      {/* Header Section */}
      <section className={styles.headerSection}>
        <div className={styles.backBtnContainer}>
          <button
            onClick={handleBackClick}
            className={styles.backButton}
            aria-label="Go back to previous page"
          >
            <FaArrowLeft /> Back
          </button>
        </div>

        <div className={styles.categoryHeader}>
          <h1 className={styles.categoryTitle}>{decodedCategoryName}</h1>
        </div>
      </section>

      <div className={styles.customShapeDividerBottom}>
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            className={styles.shapeFill}
          ></path>
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
            className={styles.shapeFill}
          ></path>
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            className={styles.shapeFill}
          ></path>
        </svg>
      </div>

      {/* Episodes Container */}
      <section className={styles.episodesContainer}>
        {episodes.length === 0 ? (
          <div className={styles.noEpisodesContainer}>
            <h2>No Episodes Found</h2>
            <p>
              There are currently no {decodedCategoryName} episodes available.
            </p>
            <button onClick={handleBackClick} className={styles.backButton}>
              <FaArrowLeft /> Go Back
            </button>
          </div>
        ) : (
          <div className={styles.episodesGrid}>
            {episodes.map((episode) => (
              <EpisodeCard
                key={episode.Id}
                episode={episode}
                favorites={favorites}
                toggleFavorites={toggleFavorites}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
