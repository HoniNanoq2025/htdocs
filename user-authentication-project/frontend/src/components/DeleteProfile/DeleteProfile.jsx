import { useState } from "react";
import { useAuth } from "../../auth/AuthContext/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./DeleteProfile.module.css";

// DeleteProfile komponent
const DeleteProfile = () => {
  const [password, setPassword] = useState(""); // Brugerens nuværende password
  const [confirmText, setConfirmText] = useState(""); // Tekst til bekræftelse af sletning
  const [showConfirmation, setShowConfirmation] = useState(false); // Vis bekræftelsesformular
  const [isLoading, setIsLoading] = useState(false); // Loader state under sletning
  const [message, setMessage] = useState(""); // Feedback besked til brugeren
  const [messageType, setMessageType] = useState(""); // 'success' eller 'error'

  const { deleteProfile, user } = useAuth(); // Hent deleteProfile funktion og brugerdata fra AuthContext

  const navigate = useNavigate();

  // Håndter initial klik på slet profil knap
  const handleInitialDelete = (e) => {
    e.preventDefault(); // Forhindre standard form submission
    setShowConfirmation(true); // Vis bekræftelsesformular
    setMessage(""); // Nulstil besked
  };

  // Håndter bekræftelse af sletning
  const handleConfirmDelete = async (e) => {
    e.preventDefault(); // Forhindre standard form submission
    setIsLoading(true); // Sæt loader state til true under sletning for at forhindre flere klik
    setMessage(""); // Nulstil besked

    const result = await deleteProfile(password, confirmText); // Kald deleteProfile fra AuthContext. Parametre: password og confirmText

    if (result.success) {
      setMessageType("success"); // Sæt beskedtype til success
      setMessage(result.message); // Vis succes besked
      // Profile is deleted, user will be redirected automatically
      setTimeout(() => {
        navigate("/");
      }, 3000); // Redirect efter 3 sekunder
    } else {
      setMessageType("error"); // Sæt beskedtype til error
      setMessage(result.message); // Vis fejl besked
    }

    setIsLoading(false); // Nulstil loader state når sletning er færdig
  };

  // Håndter annullering af sletning
  const handleCancel = () => {
    setShowConfirmation(false); // Skjul bekræftelsesformular
    setPassword(""); // Nulstil password felt
    setConfirmText(""); // Nulstil confirmText felt
    setMessage(""); // Nulstil besked
  };

  // Gå tilbage til forrige side
  const goBack = () => {
    window.history.back();
  };

  // Hvis bekræftelsesformular ikke skal vises, vis initial slet profil skærm
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
                {user?.email}) {/* Vis brugerens brugernavn og email */}
              </p>
            </div>

            {/* Knapper til at slette profil eller annullere */}
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

  // Delete bekræftelse
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
