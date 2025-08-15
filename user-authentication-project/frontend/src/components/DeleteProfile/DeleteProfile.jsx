import { useState } from "react";
import { useAuth } from "../auth/AuthContext/AuthContext";
import styles from "./DeleteProfile.module.css";

const DeleteProfile = () => {
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'

  const { deleteProfile, user } = useAuth();

  const handleInitialDelete = (e) => {
    e.preventDefault();
    setShowConfirmation(true);
    setMessage("");
  };

  const handleConfirmDelete = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    const result = await deleteProfile(password, confirmText);

    if (result.success) {
      setMessageType("success");
      setMessage(result.message);
      // Profile is deleted, user will be redirected automatically
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    } else {
      setMessageType("error");
      setMessage(result.message);
    }

    setIsLoading(false);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setPassword("");
    setConfirmText("");
    setMessage("");
  };

  const goBack = () => {
    window.history.back();
  };

  if (!showConfirmation) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h2 className={styles.title}>Delete Profile</h2>
            <p className={styles.subtitle}>This action cannot be undone</p>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningContent}>
              <p className={styles.warningText}>
                <strong>Warning:</strong> Deleting your profile will permanently
                remove:
              </p>
              <ul className={styles.warningList}>
                <li>Your account and all associated data</li>
                <li>Your login credentials</li>
                <li>All stored information</li>
              </ul>
            </div>
          </div>

          <div className={styles.actionSection}>
            <div className={styles.accountInfo}>
              <p className={styles.accountText}>
                <strong>Current account:</strong> {user?.username} (
                {user?.email})
              </p>
            </div>

            <button
              onClick={handleInitialDelete}
              className={`${styles.button} ${styles.deleteButton}`}
            >
              I want to delete my profile
            </button>

            <button
              onClick={goBack}
              className={`${styles.button} ${styles.cancelButton}`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={`${styles.title} ${styles.confirmTitle}`}>
            Confirm Deletion
          </h2>
          <p className={styles.subtitle}>
            Please confirm you want to delete your profile
          </p>
        </div>

        {message && (
          <div className={`${styles.message} ${styles[messageType]}`}>
            {message}
            {messageType === "success" && (
              <p className={styles.redirectText}>
                Redirecting you to homepage...
              </p>
            )}
          </div>
        )}

        <div className={styles.formSection}>
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Enter your password to confirm
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="Your current password"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmText" className={styles.label}>
              Type "slet min profil" to confirm
            </label>
            <input
              id="confirmText"
              name="confirmText"
              type="text"
              required
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className={styles.input}
              placeholder="slet min profil"
            />
          </div>

          <div className={styles.buttonGroup}>
            <button
              onClick={handleConfirmDelete}
              disabled={
                isLoading ||
                !password ||
                confirmText.toLowerCase().trim() !== "slet min profil"
              }
              className={`${styles.button} ${styles.confirmDeleteButton} ${
                isLoading ||
                !password ||
                confirmText.toLowerCase().trim() !== "slet min profil"
                  ? styles.disabled
                  : ""
              }`}
            >
              {isLoading ? "Deleting..." : "Delete Profile Permanently"}
            </button>

            <button
              onClick={handleCancel}
              className={`${styles.button} ${styles.cancelButton}`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteProfile;
