import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./TypeSpecialButtons.module.css";

export default function TypeSpecialButtons() {
  const [specialCategories, setSpecialCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSpecialCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/episodes.json");

        if (!response.ok) {
          throw new Error("Failed to fetch episodes data");
        }

        const episodes = await response.json();

        // Filter episodes where Special is true
        const specialEpisodes = episodes.filter(
          (episode) => episode.Special === true
        );

        // Group by "Type special" and count episodes
        const categoryMap = specialEpisodes.reduce((acc, episode) => {
          const typeSpecial = episode["Type special"] || "Other";
          if (!acc[typeSpecial]) {
            acc[typeSpecial] = {
              name: typeSpecial,
              count: 0,
              firstEpisodeImage: episode.Image,
            };
          }
          acc[typeSpecial].count += 1;
          return acc;
        }, {});

        // Convert to array and sort by name
        const categoriesArray = Object.values(categoryMap).sort((b, a) =>
          a.name.localeCompare(b.name)
        );

        setSpecialCategories(categoriesArray);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching special categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialCategories();
  }, []);

  const handleCategoryClick = (categoryName) => {
    // Navigate to the filtered episodes page
    // Using URL-safe encoding for the category name
    const encodedCategory = encodeURIComponent(categoryName);
    navigate(`/specials/${encodedCategory}`);
  };

  if (loading) {
    return (
      <section className={styles.specialCategoriesSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Special Episode Categories</h2>
        </div>
        <div className={styles.loadingContainer}>
          <p>Loading special categories...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.specialCategoriesSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Special Episode Categories</h2>
        </div>
        <div className={styles.errorContainer}>
          <p>Error loading categories: {error}</p>
        </div>
      </section>
    );
  }

  if (specialCategories.length === 0) {
    return null; // Don't render the section if no categories
  }

  return (
    <section className={styles.specialCategoriesSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Specials Categories</h2>
        <p className={styles.sectionSubtitle}>
          Explore our collection of specials
        </p>
      </div>

      <div className={styles.categoriesGrid}>
        {specialCategories.map((category) => (
          <button
            key={category.name}
            className={styles.categoryButton}
            onClick={() => handleCategoryClick(category.name)}
            aria-label={`View ${category.count} ${category.name} episodes`}
          >
            <div
              className={styles.categoryBackground}
              style={{
                backgroundImage: `url(${category.firstEpisodeImage})`,
              }}
            >
              <div className={styles.categoryOverlay}>
                <h3 className={styles.categoryName}>{category.name}</h3>
                <span className={styles.episodeCount}>
                  {category.count}{" "}
                  {category.count === 1 ? "Episode" : "Episodes"}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
