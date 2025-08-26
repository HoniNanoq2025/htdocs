// frontend/src/components/CookieBanner/CookieBanner.jsx

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import styles from "./CookieBanner.module.css";

// Cookie banner komponent
const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false); // State til at styre synlighed

  // Tjek om cookie consent allerede er givet ved mount
  useEffect(() => {
    const consent = Cookies.get("cookieConsent"); // Cookies kommer fra js-cookie bibliotek
    if (!consent) {
      setIsVisible(true); // Vis banner hvis ingen cookie consent
    }
  }, []);

  // Håndter accept af cookies
  const handleAccept = () => {
    Cookies.set("cookieConsent", "accepted", { expires: 365 }); //expires er antal dage cookies er gyldige
    setIsVisible(false);
  };

  // Håndter afvisning af cookies
  const handleDecline = () => {
    Cookies.set("cookieConsent", "declined", { expires: 365 }); 
    setIsVisible(false); // Skjul banner
  };

  // Hvis banner ikke skal vises, returner null (ingen rendering)
  if (!isVisible) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <p className={styles.message}>
          By choosing 'Accept', you agree that we and our partners use cookies
          to improve our website performance, provide you with a customized user
          experience and analyze website traffic.
        </p>
        {/* prettier-ignore */}
        <p className={styles.message}>
          You can read more about the purposes for which we and our partners use
          cookies and manage your cookie settings by clicking on 'Cookie
          Settings' or visiting our <Link to="/cookie-policy" className={styles.link} aria-label="Link to Cookie Policy page">Cookie Policy</Link>.
        </p>
      </div>
      <div className={styles.buttons}>
        <button className={styles.accept} onClick={handleAccept}>
          Accept
        </button>
        <button className={styles.decline} onClick={handleDecline}>
          Decline
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
