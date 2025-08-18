import { useState, useEffect, use } from "react";
import FilterPanel from "../../components/FilterPanel/FilterPanel";
import { useNavigate } from "react-router-dom";
import EpisodeListView from "../../components/EpisodeListView/EpisodeListView";
import Pagination from "../../components/Pagination/Pagination";
import styles from "./Episodes.module.css";

export default function Episodes({ favorites, toggleFavorites }) {
  useEffect(() => {
    document.title =
      "All Episodes || Recall The Midwife - an unofficial CTM podcast";
  }, []);

  const [episodes, setEpisodes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedTypeSpecial, setSelectedTypeSpecial] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchEpisodes = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/episodes.json");
        if (!response.ok) {
          throw new Error("Failed to fetch episode data");
        }
        const episodes = await response.json();

        setEpisodes(episodes);
      } catch (error) {
        setError(error.message);
        console.error("Error fetching episodes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, []);

  const seasons = [...new Set(episodes.map((ep) => ep.Season))];
  const typeSpecials = [
    ...new Set(episodes.map((ep) => ep["Type special"]).filter(Boolean)),
  ];

  function resetFilters() {
    setSearchTerm("");
    setSelectedSeason("");
    setSortOption("");
    setShowOnlyFavorites(false);
    setCurrentPage(1);
  }

  function parseDMY(dateStr) {
    // "14-05-2022" => "2022-05-14"
    const [day, month, year] = dateStr.split("-");
    return `${year}-${month}-${day}`;
  }

  const filteredEpisodes = episodes
    .filter((ep) => ep.Summary.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((ep) =>
      selectedSeason ? ep.Season === Number(selectedSeason) : true
    )
    .filter((ep) =>
      selectedTypeSpecial ? ep["Type special"] === selectedTypeSpecial : true
    )
    .filter((ep) => (showOnlyFavorites ? favorites.includes(ep.Id) : true))
    .sort((a, b) => {
      switch (sortOption) {
        case "titleAsc":
          return a.Title.localeCompare(b.Title);
        case "titleDesc":
          return b.Title.localeCompare(a.Title);
        case "dateAsc":
          return (
            new Date(parseDMY(a.DatePublished)) -
            new Date(parseDMY(b.DatePublished))
          );
        case "dateDesc":
          return (
            new Date(parseDMY(b.DatePublished)) -
            new Date(parseDMY(a.DatePublished))
          );
        case "seriesAsc":
          return a.Series - b.Series;
        case "seriesDesc":
          return b.Series - a.Series;
        case "specialsDesc":
          return b.Special - a.Special;
        default:
          return 0;
      }
    });

  const totalPages = Math.ceil(filteredEpisodes.length / itemsPerPage);
  const pagedEpisodes = filteredEpisodes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [filteredEpisodes, currentPage, totalPages]);

  return (
    <main id="episodes" className={styles.episodes}>
      <section className={styles.heroContainerEpisodes}>
        <div className={styles.headlineEpisodes}>
          <h1>EPISODES</h1>
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
      <section className={styles.container}>
        <div className={styles.filterPanelContainer}>
          <FilterPanel
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedSeason={selectedSeason}
            setSelectedSeason={setSelectedSeason}
            seasons={seasons}
            selectedTypeSpecial={selectedTypeSpecial}
            setSelectedTypeSpecial={setSelectedTypeSpecial}
            typeSpecials={typeSpecials}
            sortOption={sortOption}
            setSortOption={setSortOption}
            showOnlyFavorites={showOnlyFavorites}
            setShowOnlyFavorites={setShowOnlyFavorites}
            resetFilters={resetFilters}
          />
        </div>
        {loading && <p>Loading episodes...</p>}
        {error && <p className={styles.error}>Error: {error}</p>}

        <div className={styles.episodesListContainer}>
          <EpisodeListView
            episodes={pagedEpisodes}
            favorites={favorites}
            toggleFavorites={toggleFavorites}
          />
        </div>
        <div className={styles.paginationContainer}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </section>
    </main>
  );
}
