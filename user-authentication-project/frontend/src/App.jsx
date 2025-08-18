import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute/ProtectedRoute";
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
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

export default function App() {
  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/episodes" element={<Episodes />} />
          <Route path="episodes/:Id" element={<EpisodeDetail />}></Route>
          <Route
            path="/specials/:categoryName"
            element={<SpecialEpisodesList />}
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
