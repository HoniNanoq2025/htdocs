import { createContext, useContext, useState, useEffect } from "react";
import styles from "./AuthContext.module.css";

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in when app starts
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check authentication status with backend
  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/user.php", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const text = await response.text(); // get raw text first
        if (text) {
          try {
            const userData = JSON.parse(text);
            setUser(userData);
            setIsAuthenticated(true);
          } catch (jsonError) {
            console.error("Failed to parse JSON:", jsonError);
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          // Empty response body
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/login.php", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user || { email }); // Use the user data from your PHP response
        setIsAuthenticated(true);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Network error occurred" };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (username, email, password) => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/register.php", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Optionally auto-login after registration
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, message: data.message };
      } else {
        return {
          success: false,
          message: data.message || "Registration failed",
        };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, message: "Network error occurred" };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await fetch("http://localhost:8000/api/logout.php", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:8000/api/forgot-password.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      return {
        success: response.ok,
        message:
          data.message ||
          (response.ok ? "Reset email sent" : "Failed to send reset email"),
      };
    } catch (error) {
      console.error("Forgot password error:", error);
      return { success: false, message: "Network error occurred" };
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:8000/api/reset-password.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, password: newPassword }),
        }
      );

      const data = await response.json();
      return {
        success: response.ok,
        message:
          data.message ||
          (response.ok ? "Password reset successful" : "Password reset failed"),
      };
    } catch (error) {
      console.error("Reset password error:", error);
      return { success: false, message: "Network error occurred" };
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Example usage component to demonstrate the context
const AuthDemo = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Authentication Status</h2>

      {isAuthenticated ? (
        <div className={styles.userInfo}>
          <p className={styles.loggedInText}>
            ✓ Logged in as: {user?.username}
          </p>
          <p className={styles.emailText}>Email: {user?.email}</p>
          <button onClick={logout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      ) : (
        <div className={styles.userInfo}>
          <p className={styles.loggedOutText}>✗ Not logged in</p>
          <p className={styles.helpText}>Use your login form to authenticate</p>
        </div>
      )}
    </div>
  );
};

export default AuthDemo;
