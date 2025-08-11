import React from "react";
import { useAuth } from "./AuthContext"; // Adjust import path as needed

// CSS Modules styles
const styles = {
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
  },
  spinner: {
    width: "3rem",
    height: "3rem",
    border: "2px solid #e5e7eb",
    borderTop: "2px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    marginLeft: "0.75rem",
    color: "#4b5563",
  },
  accessDeniedContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
  },
  accessDeniedCard: {
    maxWidth: "28rem",
    width: "100%",
    backgroundColor: "white",
    borderRadius: "0.5rem",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    padding: "1.5rem",
    textAlign: "center",
  },
  iconContainer: {
    marginBottom: "1rem",
  },
  lockIcon: {
    margin: "0 auto",
    height: "4rem",
    width: "4rem",
    color: "#ef4444",
  },
  accessDeniedTitle: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "0.5rem",
  },
  accessDeniedText: {
    color: "#4b5563",
    marginBottom: "1rem",
  },
  loginButton: {
    display: "inline-block",
    backgroundColor: "#3b82f6",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "0.25rem",
    textDecoration: "none",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
};

// Add keyframes for spinner animation
const spinnerKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Insert keyframes into document head
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = spinnerKeyframes;
  document.head.appendChild(style);
}

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
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <span style={styles.loadingText}>Checking authentication...</span>
      </div>
    );
  }

  // If not authenticated, show fallback or redirect message
  if (!isAuthenticated) {
    if (fallback) {
      return fallback;
    }

    return (
      <div style={styles.accessDeniedContainer}>
        <div style={styles.accessDeniedCard}>
          <div style={styles.iconContainer}>
            <svg
              style={styles.lockIcon}
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
          <h2 style={styles.accessDeniedTitle}>Access Denied</h2>
          <p style={styles.accessDeniedText}>
            You need to be logged in to access this page.
          </p>
          <a
            href={redirectTo}
            style={styles.loginButton}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#2563eb")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#3b82f6")}
          >
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
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <span style={styles.loadingText}>Checking authentication...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={styles.accessDeniedContainer}>
        <div style={styles.accessDeniedCard}>
          <h2 style={styles.accessDeniedTitle}>Access Denied</h2>
          <p style={styles.accessDeniedText}>
            You need to be logged in to access this page.
          </p>
          <a
            href={redirectTo}
            style={styles.loginButton}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#2563eb")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#3b82f6")}
          >
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

    const warningIconStyles = {
      ...styles.lockIcon,
      color: "#f59e0b",
    };

    const goBackButtonStyles = {
      ...styles.loginButton,
      backgroundColor: "#6b7280",
    };

    return (
      <div style={styles.accessDeniedContainer}>
        <div style={styles.accessDeniedCard}>
          <div style={styles.iconContainer}>
            <svg
              style={warningIconStyles}
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
          <h2 style={styles.accessDeniedTitle}>Insufficient Permissions</h2>
          <p style={styles.accessDeniedText}>
            You don't have the required permissions to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            style={goBackButtonStyles}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#4b5563")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#6b7280")}
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

  const demoStyles = {
    container: {
      padding: "1.5rem",
      maxWidth: "42rem",
      margin: "0 auto",
    },
    title: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      marginBottom: "1.5rem",
    },
    exampleSection: {
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
    },
    exampleCard: {
      border: "1px solid #d1d5db",
      borderRadius: "0.5rem",
      padding: "1rem",
    },
    exampleTitle: {
      fontSize: "1.125rem",
      fontWeight: "600",
      marginBottom: "0.5rem",
    },
    protectedContent: {
      backgroundColor: "#ecfdf5",
      border: "1px solid #bbf7d0",
      borderRadius: "0.25rem",
      padding: "0.75rem",
    },
    protectedText: {
      color: "#065f46",
    },
    protectedSubtext: {
      fontSize: "0.875rem",
      color: "#047857",
      marginTop: "0.25rem",
    },
    adminContent: {
      backgroundColor: "#faf5ff",
      border: "1px solid #e9d5ff",
      borderRadius: "0.25rem",
      padding: "0.75rem",
    },
    adminText: {
      color: "#581c87",
    },
    adminSubtext: {
      fontSize: "0.875rem",
      color: "#7c3aed",
      marginTop: "0.25rem",
    },
    publicContent: {
      backgroundColor: "#eff6ff",
      border: "1px solid #bfdbfe",
      borderRadius: "0.25rem",
      padding: "0.75rem",
    },
    publicText: {
      color: "#1e40af",
    },
    publicSubtext: {
      fontSize: "0.875rem",
      color: "#2563eb",
      marginTop: "0.25rem",
    },
    codeSection: {
      marginTop: "2rem",
      padding: "1rem",
      backgroundColor: "#f9fafb",
      borderRadius: "0.5rem",
    },
    codeTitle: {
      fontWeight: "600",
      marginBottom: "0.5rem",
    },
    codeBlock: {
      fontSize: "0.875rem",
      color: "#4b5563",
      whiteSpace: "pre-wrap",
      fontFamily: "monospace",
      backgroundColor: "white",
      padding: "0.75rem",
      borderRadius: "0.25rem",
      border: "1px solid #e5e7eb",
    },
  };

  return (
    <div style={demoStyles.container}>
      <h1 style={demoStyles.title}>Protected Route Examples</h1>

      <div style={demoStyles.exampleSection}>
        {/* Example 1: Basic protected content */}
        <div style={demoStyles.exampleCard}>
          <h3 style={demoStyles.exampleTitle}>Basic Protected Content</h3>
          <ProtectedRoute>
            <div style={demoStyles.protectedContent}>
              <p style={demoStyles.protectedText}>
                🎉 This content is only visible to authenticated users!
              </p>
              <p style={demoStyles.protectedSubtext}>
                Welcome, {user?.username}!
              </p>
            </div>
          </ProtectedRoute>
        </div>

        {/* Example 2: Role-based protected content */}
        <div style={demoStyles.exampleCard}>
          <h3 style={demoStyles.exampleTitle}>Admin-Only Content</h3>
          <RoleProtectedRoute requiredRole="admin">
            <div style={demoStyles.adminContent}>
              <p style={demoStyles.adminText}>🔒 This is admin-only content!</p>
              <p style={demoStyles.adminSubtext}>
                Only administrators can see this section.
              </p>
            </div>
          </RoleProtectedRoute>
        </div>

        {/* Example 3: Always visible content for comparison */}
        <div style={demoStyles.exampleCard}>
          <h3 style={demoStyles.exampleTitle}>Public Content</h3>
          <div style={demoStyles.publicContent}>
            <p style={demoStyles.publicText}>
              🌐 This content is visible to everyone, authenticated or not.
            </p>
            <p style={demoStyles.publicSubtext}>
              Current auth status:{" "}
              {isAuthenticated ? "Logged in" : "Not logged in"}
            </p>
          </div>
        </div>
      </div>

      <div style={demoStyles.codeSection}>
        <h4 style={demoStyles.codeTitle}>Usage Examples:</h4>
        <pre style={demoStyles.codeBlock}>
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
