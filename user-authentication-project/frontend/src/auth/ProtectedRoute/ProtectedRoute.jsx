// user-authentication-project/frontend/src/auth/ProtectedRoute/ProtectedRoute.jsx

import { useAuth } from "../AuthContext/AuthContext.jsx"; // Adjust import path as needed
import styles from "./ProtectedRoute.module.css";

// Protected Route wrapper component
//
export const ProtectedRoute = ({
  children, // Det beskyttede indhold der skal vises
  redirectTo = "/login", // Hvor brugeren skal sendes hvis ikke logget ind
  fallback = null, // Alternativ komponent at vise i stedet for standard besked
}) => {
  const { isAuthenticated, loading } = useAuth();
  // Henter auth status og loading state fra konteksten

  // Vis loading state mens authentication tjekkes
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <span className={styles.loadingText}>Checking authentication...</span>
      </div>
    );
  }

  // Hvis ikke authenticated, vis fallback eller redirect mesked
  if (!isAuthenticated) {
    // Hvis der er en brugerdefineret fallback komponent, vis den
    if (fallback) {
      return fallback;
    }

    // Ellers vis standard "adgang nægtet" besked
    return (
      <div className={styles.accessDeniedContainer}>
        <div className={styles.accessDeniedCard}>
          <div className={styles.iconContainer}>
            {/* SVG ikon af en lås */}
            <svg
              className={styles.lockIcon}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className={styles.accessDeniedTitle}>Access Denied</h2>
          <p className={styles.accessDeniedText}>
            You need to be logged in to access this page.
          </p>
          <a href={redirectTo} className={styles.loginButton}>
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Hvis authenticated, vis det beskyttede indhold
  return children;
};

// Alternativ version med rolle-baseret adgangskontrol
// Tillader kun brugere med specifikke roller at se indholdet
export const RoleProtectedRoute = ({
  children, // Det beskyttede indhold
  requiredRole = null, // Påkrævet rolle for at få adgang
  redirectTo = "/login", // Redirect destination for ikke-autentificerede
  unauthorizedFallback = null, // Fallback for brugere uden tilstrækkelige rettigheder
}) => {
  // Henter brugerdata og auth status fra konteksten
  const { user, isAuthenticated, loading } = useAuth();

  // Vis loading state mens authentication tjekkes
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <span className={styles.loadingText}>Checking authentication...</span>
      </div>
    );
  }

  // Hvis ikke authenticated, vis adgang nægtet besked
  if (!isAuthenticated) {
    return (
      <div className={styles.accessDeniedContainer}>
        <div className={styles.accessDeniedCard}>
          <h2 className={styles.accessDeniedTitle}>Access Denied</h2>
          <p className={styles.accessDeniedText}>
            You need to be logged in to access this page.
          </p>
          <a href={redirectTo} className={styles.loginButton}>
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Tjek rolle-baseret adgang hvis påkrævet
  if (requiredRole && user?.role !== requiredRole) {
    if (unauthorizedFallback) {
      return unauthorizedFallback;
    }

    // Ellers vis standard "utilstrækkelige rettigheder" besked
    return (
      <div className={styles.accessDeniedContainer}>
        <div className={styles.accessDeniedCard}>
          <div className={styles.iconContainer}>
            {/* SVG advarselsikon */}
            <svg
              className={styles.warningIcon}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.084 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className={styles.accessDeniedTitle}>Insufficient Permissions</h2>
          <p className={styles.accessDeniedText}>
            You don't have the required permissions to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className={styles.goBackButton}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Hvis alle tjek passer, vis det beskyttede indhold
  return children;
};

// Demo komponent der viser hvordan man bruger beskyttede ruter
const ProtectedRouteDemo = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className={styles.demoContainer}>
      <h1 className={styles.demoTitle}>Protected Route Examples</h1>

      <div className={styles.exampleSection}>
        {/* Eksempel 1: Grundlæggende beskyttet indhold */}
        <div className={styles.exampleCard}>
          <h3 className={styles.exampleTitle}>Basic Protected Content</h3>
          <ProtectedRoute>
            <div className={styles.protectedContent}>
              <p className={styles.protectedText}>
                🎉 This content is only visible to authenticated users!
              </p>
              <p className={styles.protectedSubtext}>
                Welcome, {user?.username}!
              </p>
            </div>
          </ProtectedRoute>
        </div>

        {/* Eksempel 2: Rolle-baseret beskyttet indhold */}
        <div className={styles.exampleCard}>
          <h3 className={styles.exampleTitle}>Admin-Only Content</h3>
          <RoleProtectedRoute requiredRole="admin">
            <div className={styles.adminContent}>
              <p className={styles.adminText}>🔒 This is admin-only content!</p>
              <p className={styles.adminSubtext}>
                Only administrators can see this section.
              </p>
            </div>
          </RoleProtectedRoute>
        </div>

        {/* Eksempel 3: Altid synligt indhold til sammenligning */}
        <div className={styles.exampleCard}>
          <h3 className={styles.exampleTitle}>Public Content</h3>
          <div className={styles.publicContent}>
            <p className={styles.publicText}>
              🌐 This content is visible to everyone, authenticated or not.
            </p>
            <p className={styles.publicSubtext}>
              Current auth status:{" "}
              {isAuthenticated ? "Logged in" : "Not logged in"}
            </p>
          </div>
        </div>
      </div>

      {/* Kode eksempler sektion */}
      <div className={styles.codeSection}>
        <h4 className={styles.codeTitle}>Usage Examples:</h4>
        {/* Vis kode eksempler i en præformat blok */}
        <pre className={styles.codeBlock}>
          {`// Grundlæggende benyttelse
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>

            // Med brugerdefineret redirect
            <ProtectedRoute redirectTo="/signin">
              <Profile />
            </ProtectedRoute>

            // Rolle-baseret beskyttelse
            <RoleProtectedRoute requiredRole="admin">
              <AdminPanel />
            </RoleProtectedRoute>`}
        </pre>
      </div>
    </div>
  );
};

export default ProtectedRouteDemo;
