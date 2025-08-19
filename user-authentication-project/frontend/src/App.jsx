import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute/ProtectedRoute";
import { useState, useEffect } from "react";
import { useAuth } from "./auth/AuthContext/AuthContext";
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile/Profile";
import LoginForm from "./components/LoginForm/LoginForm";
import RegistrationForm from "./components/RegistrationForm/RegistrationForm";
import ForgotPasswordForm from "./components/ForgotPasswordForm/ForgotPasswordForm";
import ResetPasswordForm from "./components/ResetPasswordForm/ResetPasswordForm";
import DeleteProfile from "./components/DeleteProfile/DeleteProfile";
import Episodes from "./pages/Episodes/Episodes";
import EpisodeDetail from "./components/EpisodeDetail/EpisodeDetail";
import SpecialEpisodesList from "./pages/SpecialEpisodesList/SpecialEpisodesList";
import CookiePolicy from "./pages/CookiePolicy/CookiePolicy";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import CookieBanner from "./components/CookieBanner/CookieBanner";
import styles from "./App.module.css";
import {
  getFavoritesFromStorage,
  saveFavoritesToStorage,
} from "./utils/localStorage";

import {
  getFavoritesFromBackend,
  toggleFavoriteOnBackend,
} from "./utils/favoriteAPI";

export default function App() {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    async function fetchFavorites() {
      if (isAuthenticated) {
        const backendFavorites = await getFavoritesFromBackend();
        setFavorites(backendFavorites);
      } else {
        const localFavorites = getFavoritesFromStorage();
        setFavorites(localFavorites);
      }
    }

    fetchFavorites();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      saveFavoritesToStorage(favorites);
    }
    // If authenticated, syncing happens in toggle function
  }, [favorites, isAuthenticated]);

  const toggleFavorites = async (id) => {
    if (isAuthenticated) {
      const success = await toggleFavoriteOnBackend(id);
      if (success) {
        setFavorites((prev) =>
          prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
        );
      }
    } else {
      setFavorites((prev) =>
        prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
      );
    }
  };

  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        <Routes>
          <Route
            path="/"
            element={
              <Home favorites={favorites} toggleFavorites={toggleFavorites} />
            }
          />
          <Route path="/about" element={<About />} />
          <Route
            path="/episodes"
            element={
              <Episodes
                favorites={favorites}
                toggleFavorites={toggleFavorites}
              />
            }
          />
          <Route
            path="episodes/:Id"
            element={
              <EpisodeDetail
                favorites={favorites}
                toggleFavorites={toggleFavorites}
              />
            }
          ></Route>
          <Route
            path="/specials/:categoryName"
            element={
              <SpecialEpisodesList
                favorites={favorites}
                toggleFavorites={toggleFavorites}
              />
            }
          />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          <Route path="/reset-password" element={<ResetPasswordForm />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          {/* Protected routes */}
          <Route
            path="/contact"
            element={
              <ProtectedRoute>
                <Contact />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Delete Profile Route */}
          <Route
            path="/delete-profile"
            element={
              <ProtectedRoute>
                <DeleteProfile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <CookieBanner />
      <Footer />
    </div>
  );
}
