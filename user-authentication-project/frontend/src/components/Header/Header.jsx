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
      <div className={styles.logo}>MySite</div>

      {/* Desktop Navigation */}
      <nav className={styles.desktopNav}>
        <NavLink to="/" className={styles.link}>
          Home
        </NavLink>
        <NavLink to="/about" className={styles.link}>
          About
        </NavLink>
        <NavLink to="/contact" className={styles.link}>
          Contact
        </NavLink>
        <NavLink to="/profile" className={styles.link}>
          Profile
        </NavLink>

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
          <button
            onClick={handleLogout}
            className={styles.link}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            Logout
          </button>
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
            to="/contact"
            className={styles.mobileLink}
            onClick={handleLinkClick}
          >
            Contact
          </NavLink>
          <NavLink
            to="/profile"
            className={styles.mobileLink}
            onClick={handleLinkClick}
          >
            Profile
          </NavLink>

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
            <button
              onClick={() => {
                handleLinkClick();
                handleLogout();
              }}
              className={styles.mobileLink}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
