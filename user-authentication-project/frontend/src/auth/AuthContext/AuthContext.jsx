// user-authentication-project/frontend/src/auth/AuthContext/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from "react";
import styles from "./AuthContext.module.css";

// Opretter authentification-kontekst til deling af brugerdata på tværs af komponenter
const AuthContext = createContext();

// Brugerdefineret hook til at få adgang til AuthContext
// Sikrer at komponenter kun bruger konteksten inden for AuthProvider
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Authentication-provider komponent der wrapper hele appen
// Håndterer al user authentication og tilstandsstyring
export const AuthProvider = ({ children }) => {
  // State variabler til at holde styr på brugerens tilstand
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Tjekker om brugeren allerede er logget ind når appen starter
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Tjekker authentification status med backend serveren
  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      // Sender GET request til backend for at tjekke om brugeren er logget ind
      const response = await fetch("http://localhost:8000/user.php", {
        method: "GET", // Benytter GET til at hente brugerdata
        credentials: "include", // Inkluderer cookies (session IDs, auth tokens) til session håndtering
        headers: {
          "Content-Type": "application/json", // Forventer JSON response
        },
      });

      if (response.ok) {
        // Hvis svaret fra serveren er 200 OK
        const text = await response.text();
        if (text) {
          try {
            // Forsøger at parse JSON response
            const userData = JSON.parse(text);
            setUser(userData); // Gemmer brugerdata
            setIsAuthenticated(true); // Markerer som logget ind
          } catch (jsonError) {
            // JSON kunne ikke parses → behandler som ikke logget ind
            console.error("Failed to parse JSON:", jsonError);
            setUser(null); // Rydder brugerdata
            setIsAuthenticated(false); // Markerer som ikke logget ind
          }
        } else {
          // Tom response betyder ikke logget ind
          setUser(null);
          setIsAuthenticated(false);
        }
      } else if (response.status === 401) {
        // 401-fejl er forventet når man ikke er logget ind
        // -> stille håndtering (ingen fejl vises)
        setUser(null);
        setIsAuthenticated(false);
      } else {
        // Andre fejl (500, netværksfejl, osv.) -> logges som uventede
        console.error(
          "Unexpected auth check error:",
          response.status, // HTTP statuskode (fx 500, 403, 404 osv.).
          response.statusText // Status tekst (fx "Internal Server Error").
        );
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      // Only log actual network/connection errors, not expected 401s
      if (!error.message.includes("401")) {
        console.error("Auth check network error:", error);
      }
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Login funktion - autenticate user via email + password parametre
  const login = async (email, password) => {
    try {
      setLoading(true); // Starter loading state

      // Benyt API router fremfor direkte fil-adgang
      const response = await fetch("http://localhost:8000/api/login.php", {
        method: "POST", // Benytter POST til at sende login data
        credentials: "include", // Inkluderer cookies til session håndtering
        headers: {
          "Content-Type": "application/json", // Sender JSON data
        },
        // Your backend expects 'username' field for login (can be email or username)
        body: JSON.stringify({ email, password }), // Sender email og password som JSON
      });

      const data = await response.json(); //

      if (response.ok && data.success) {
        // Hvis login var succesfuldt
        setUser(data.user || { email }); // Use the user data from your PHP response
        setIsAuthenticated(true); // Markerer som logget ind
        return { success: true, message: data.message }; // Returnerer succes besked
      } else {
        return { success: false, message: data.message || "Login failed" }; // Returnerer fejl besked
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Network error occurred" };
    } finally {
      setLoading(false); // Stop loading state uanset resultat
    }
  };

  // Register function
  const register = async (username, email, password) => {
    // Registreringsfunktion der sender data til backend
    //Parametre: brugernavn, email, password
    try {
      setLoading(true);

      // Benyt API router fremfor direkte fil-adgang
      const response = await fetch("http://localhost:8000/api/register.php  ", {
        method: "POST", // Benytter POST til at sende registreringsdata
        credentials: "include", // Inkluderer cookies til session håndtering
        headers: {
          "Content-Type": "application/json", // Sender JSON data
        },
        body: JSON.stringify({ username, email, password }), // Sender registreringsdata som JSON
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Hvis registrering var succesfuld
        return {
          success: true, // Registrering lykkedes
          message: data.message || "Registration successful",
        }; // Returnerer succes besked
      } else { 
        return {
          // Hvis registrering fejlede
          success: false, // Registrering fejlede
          message: data.message || data.error || "Registration failed",
        };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, message: "Network error occurred" };
    } finally {
      setLoading(false); // Stop loading state uanset resultat
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await fetch("http://localhost:8000/api/logout.php", {
        method: "POST", // Bruger POST-metoden, fordi vi sender en handling (log ud)
        credentials: "include", // Sender cookies/credentials med, så serveren kan genkende brugeren
        headers: {
          "Content-Type": "application/json", // Fortæller serveren, at vi sender JSON-data
        },
      });
    } catch (error) {
      // Logger fejl, hvis der sker noget galt under logout
      console.error("Logout error:", error);
    } finally {
      setUser(null); // Nulstiller bruger-tilstanden (ingen bruger er logget ind)
      setIsAuthenticated(false); // Sætter "er logget ind"-status til false
      setLoading(false); // Stopper loading-tilstanden
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      setLoading(true);

      // Use the API router - remove .php extension
      const response = await fetch(
        "http://localhost:8000/api/forgot-password.php",
        {
          method: "POST", // Benytter POST til at sende email data til backend
          headers: {
            "Content-Type": "application/json",
          }, // Sender JSON data
          credentials: "include", // Inkluderer cookies til session håndtering
          body: JSON.stringify({ email }), // Sender email som JSON
        }
      );

      // I stedet for at antage at det er valid JSON:
      const text = await response.text(); // Hent rå tekst response
      console.log("Forgot password raw response:", text); 

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("JSON parse error:", e, text);
        return {
          success: false,
          message: "Server response was not valid JSON",
        };
      }

      // Your backend always returns success: true for security (prevent enumeration)
      // So check the actual success field from the response
      return {
        success: data.success || response.ok,
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

      // Use the API router - remove .php extension
      const response = await fetch(
        "http://localhost:8000/api/reset-password.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Add credentials for session handling
          body: JSON.stringify({ token, password: newPassword }),
        }
      );

      const data = await response.json();

      return {
        success: data.success !== undefined ? data.success : response.ok,
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

  // Change password function (for authenticated users)
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:8000/api/new-password.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Important: include session cookies
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) { 
        // User er ikke authenticated, redirect til login
        setUser(null); // nulstil bruger state
        setIsAuthenticated(false); // sæt isAuthenticated til false
        return {
          success: false,
          message: "Session expired. Please log in again.",
        };
      }

      return { // Hvis password-ændring er en succes
        success: data.success !== undefined ? data.success : response.ok,
        message:
          data.message ||
          (response.ok
            ? "Password changed successfully"
            : "Password change failed"),
      }; // hvis response.ok er true, returner succes besked ellers fejl besked
    } catch (error) {
      console.error("Change password error:", error);
      return { success: false, message: "Network error occurred" };
    } finally {
      setLoading(false);
    }
  };

  // Slet din profil -function
  // Denne funktion gør det muligt for brugere at slette deres konto
  const deleteProfile = async (password, confirmText) => {
    try {
      setLoading(true); // Starter loading state

      const response = await fetch(
        "http://localhost:8000/api/delete-profile.php",
        {
          method: "POST", // Bruger POST-metoden til at sende slette-anmodningen til serveren
          headers: {
            "Content-Type": "application/json", // Sender JSON data
          },
          credentials: "include", // Inkluderer cookies til session håndtering
          body: JSON.stringify({
            password,
            confirmText,
          }), // Sender password og confirmText som JSON
        }
      );

      const data = await response.json();

      if (data.success) {
        // Nulstil auth state eftersom konto er slettet
        setUser(null);
        setIsAuthenticated(false);
      }

      return {
        success: data.success !== undefined ? data.success : response.ok,
        message:
          data.message ||
          (response.ok
            ? "Profile deleted successfully"
            : "Profile deletion failed"),
      };
    } catch (error) {
      console.error("Delete profile error:", error);
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
    changePassword,
    deleteProfile,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Example usage component to demonstrate the context
export const AuthDemo = () => {
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
