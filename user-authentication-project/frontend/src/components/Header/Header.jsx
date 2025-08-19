import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoClose } from "react-icons/io5";
import { useAuth } from "../../auth/AuthContext/AuthContext"; // adjust the path if needed

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLinkClick = () => setMenuOpen(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className={styles.header}>
      {/* <div className={styles.logo}>MySite</div> */}

      {/* Desktop Navigation */}
      <nav className={styles.desktopNav}>
        <NavLink to="/" className={styles.link}>
          Home
        </NavLink>
        <NavLink to="/about" className={styles.link}>
          About
        </NavLink>
        <NavLink to="/episodes" className={styles.link}>
          Episodes
        </NavLink>
        <NavLink to="/profile" className={styles.link}>
          Profile
        </NavLink>
        {/* External link */}
        <a
          href="https://www.redbubble.com/people/ReCallTheMidPod/shop"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          Shop
        </a>

        {!isAuthenticated ? (
          <>
            <NavLink to="/login" className={styles.link}>
              Login
            </NavLink>
            <NavLink to="/register" className={styles.link}>
              Register
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/contact" className={styles.link}>
              Contact us
            </NavLink>
            <button
              onClick={handleLogout}
              className={`${styles.link} ${styles.linkButton}`}
            >
              Logout
            </button>
          </>
        )}
      </nav>

      {/* Mobile Menu Icon */}
      <div className={styles.burgerIcon} onClick={() => setMenuOpen(true)}>
        <RxHamburgerMenu size={28} />
      </div>

      {/* Mobile Navigation Overlay */}
      <div className={`${styles.overlay} ${menuOpen ? styles.show : ""}`}>
        <div className={styles.closeIcon} onClick={() => setMenuOpen(false)}>
          <IoClose size={28} />
        </div>
        <nav className={styles.mobileNav}>
          <NavLink
            to="/"
            className={styles.mobileLink}
            onClick={handleLinkClick}
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className={styles.mobileLink}
            onClick={handleLinkClick}
          >
            About
          </NavLink>
          <NavLink
            to="/episodes"
            className={styles.mobileLink}
            onClick={handleLinkClick}
          >
            Episodes
          </NavLink>
          <NavLink
            to="/profile"
            className={styles.mobileLink}
            onClick={handleLinkClick}
          >
            Profile
          </NavLink>
          <a
            href="https://www.redbubble.com/people/ReCallTheMidPod/shop"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mobileLink}
            onClick={handleLinkClick}
          >
            Shop
          </a>

          {!isAuthenticated ? (
            <>
              <NavLink
                to="/login"
                className={styles.mobileLink}
                onClick={handleLinkClick}
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className={styles.mobileLink}
                onClick={handleLinkClick}
              >
                Register
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/contact"
                className={styles.mobileLink}
                onClick={handleLinkClick}
              >
                Contact
              </NavLink>
              <button
                onClick={handleLogout}
                className={`${styles.mobileLink} ${styles.mobileLinkButton}`}
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
