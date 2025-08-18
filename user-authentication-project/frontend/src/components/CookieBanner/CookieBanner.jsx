import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import styles from "./CookieBanner.module.css";

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = Cookies.get("cookieConsent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    Cookies.set("cookieConsent", "accepted", { expires: 365 }); //expires er antal dage cookies er gyldige
    setIsVisible(false);
  };

  const handleDecline = () => {
    Cookies.set("cookieConsent", "declined", { expires: 365 });
    setIsVisible(false);
  };

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
