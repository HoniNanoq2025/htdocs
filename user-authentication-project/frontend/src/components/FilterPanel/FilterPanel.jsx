import styles from "./FilterPanel.module.css";

export default function FilterPanel({
  searchTerm,
  setSearchTerm,
  selectedSeason,
  setSelectedSeason,
  seasons,
  selectedTypeSpecial,
  setSelectedTypeSpecial,
  typeSpecials,
  sortOption,
  setSortOption,
  showOnlyFavorites,
  setShowOnlyFavorites,
  resetFilters,
}) {
  return (
    <section className={styles.filterPanel}>
      <input
        type="text"
        placeholder="Search summaries..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.input}
      />

      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={showOnlyFavorites}
          onChange={(e) => setShowOnlyFavorites(e.target.value)}
        />
        Show only favorites
      </label>

      <select
        value={selectedSeason}
        onChange={(e) => setSelectedSeason(e.target.value)}
        className={styles.select}
      >
        <option value="">Podcast Season</option>
        {seasons.map((season) => (
          <option key={season} value={season}>
            {season}
          </option>
        ))}
      </select>

      <select
        value={selectedTypeSpecial}
        onChange={(e) => setSelectedTypeSpecial(e.target.value)}
        className={styles.select}
      >
        <option value="">Type Special</option>
        {typeSpecials.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      <select
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value)}
        className={styles.select}
      >
        <option value="">Sort by</option>
        <option value="titleAsc">Title (A-Z)</option>
        <option value="titleDesc">Title (Z-A)</option>
        <option value="dateAsc">Date Ascending</option>
        <option value="dateDesc">Date Descending</option>
        <option value="specialsDesc">Specials first</option>
      </select>

      <button onClick={resetFilters} className={styles.resetBtn}>
        Reset filters
      </button>
    </section>
  );
}
