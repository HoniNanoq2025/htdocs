import React from "react";
import { useAuth } from "../AuthContext/AuthContext.jsx"; // Adjust import path as needed
import styles from "./ProtectedRoute.module.css";

// Protected Route wrapper component
export const ProtectedRoute = ({
  children,
  redirectTo = "/login",
  fallback = null,
}) => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <span className={styles.loadingText}>Checking authentication...</span>
      </div>
    );
  }

  // If not authenticated, show fallback or redirect message
  if (!isAuthenticated) {
    if (fallback) {
      return fallback;
    }

    return (
      <div className={styles.accessDeniedContainer}>
        <div className={styles.accessDeniedCard}>
          <div className={styles.iconContainer}>
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

  // If authenticated, render the protected content
  return children;
};

// Alternative version with role-based access control
export const RoleProtectedRoute = ({
  children,
  requiredRole = null,
  redirectTo = "/login",
  unauthorizedFallback = null,
}) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <span className={styles.loadingText}>Checking authentication...</span>
      </div>
    );
  }

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

  // Check role-based access if required
  if (requiredRole && user?.role !== requiredRole) {
    if (unauthorizedFallback) {
      return unauthorizedFallback;
    }

    return (
      <div className={styles.accessDeniedContainer}>
        <div className={styles.accessDeniedCard}>
          <div className={styles.iconContainer}>
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

  return children;
};

// Demo component showing how to use protected routes
const ProtectedRouteDemo = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className={styles.demoContainer}>
      <h1 className={styles.demoTitle}>Protected Route Examples</h1>

      <div className={styles.exampleSection}>
        {/* Example 1: Basic protected content */}
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

        {/* Example 2: Role-based protected content */}
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

        {/* Example 3: Always visible content for comparison */}
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

      <div className={styles.codeSection}>
        <h4 className={styles.codeTitle}>Usage Examples:</h4>
        <pre className={styles.codeBlock}>
          {`// Basic usage
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// With custom redirect
<ProtectedRoute redirectTo="/signin">
  <Profile />
</ProtectedRoute>

// Role-based protection
<RoleProtectedRoute requiredRole="admin">
  <AdminPanel />
</RoleProtectedRoute>`}
        </pre>
      </div>
    </div>
  );
};

export default ProtectedRouteDemo;
