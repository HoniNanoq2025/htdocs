import styles from "./Pagination.module.css";

export default function Pagination({
  currentPage,
  totalPages,
  setCurrentPage,
}) {
  const prev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const next = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className={styles.pagination}>
      <button onClick={prev} disabled={currentPage === 1}>
        Previous
      </button>

      <span className={styles.pageInfo}>
        Page {currentPage} of {totalPages}
      </span>

      <button onClick={next} disabled={currentPage === totalPages}>
        Next
      </button>
    </div>
  );
}
