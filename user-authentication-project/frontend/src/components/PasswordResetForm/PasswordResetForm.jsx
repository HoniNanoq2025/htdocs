import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext/AuthContext";
import styles from "./PasswordResetForm.module.css";

const PasswordResetForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm();

  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword, loading } = useAuth();

  const token = searchParams.get("token");

  // Check if token exists
  useEffect(() => {
    if (!token) {
      setMessage(
        "Ugyldigt eller manglende token. Anmod venligst om et nyt link."
      );
    }
  }, [token]);

  const onSubmit = async (data) => {
    if (!token) {
      setMessage("Ugyldigt token. Anmod venligst om et nyt link.");
      return;
    }

    try {
      const result = await resetPassword(token, data.newPassword);

      if (result.success) {
        setMessage(
          "Din adgangskode er blevet nulstillet! Du omdirigeres til login siden..."
        );
        reset();
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setMessage(result.message || "Fejl ved nulstilling af adgangskode");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setMessage("Der opstod en fejl. Prøv venligst igen.");
    }
  };

  // If no token, show error state
  if (!token) {
    return (
      <div className={styles.container}>
        <div className={styles.form}>
          <h2 className={styles.formHeader}>Nulstil adgangskode</h2>
          <p className={styles.error}>Dette link er ugyldigt eller udløbet.</p>
          <Link to="/forgot-password" className={styles.link}>
            Anmod om nyt link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <form
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
        action="submit"
      >
        <h2 className={styles.formHeader}>Nulstil din adgangskode</h2>

        {/* INPUT NEW PASSWORD */}
        <input
          {...register("newPassword", {
            required: "Ny adgangskode er påkrævet",
            minLength: {
              value: 6,
              message: "Adgangskoden skal indeholde mindst 6 tegn",
            },
          })}
          type="password"
          placeholder="Ny adgangskode (min. 6 tegn)"
          className={`${styles.input} ${
            errors.newPassword ? styles.inputError : ""
          }`}
          aria-invalid={errors.newPassword ? "true" : "false"}
        />
        {errors.newPassword && (
          <p role="alert" className={styles.errors}>
            {errors.newPassword.message}
          </p>
        )}

        {/* CONFIRM NEW PASSWORD */}
        <input
          {...register("confirmPassword", {
            required: "Bekræft adgangskode er påkrævet",
            validate: (value) =>
              value === watch("newPassword") ||
              "Adgangskoderne stemmer ikke overens",
          })}
          type="password"
          placeholder="Bekræft ny adgangskode"
          className={`${styles.input} ${
            errors.confirmPassword ? styles.inputError : ""
          }`}
          aria-invalid={errors.confirmPassword ? "true" : "false"}
        />
        {errors.confirmPassword && (
          <p role="alert" className={styles.errors}>
            {errors.confirmPassword.message}
          </p>
        )}

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? "Nulstiller..." : "Nulstil Adgangskode"}
        </button>

        {message && (
          <p
            className={`${styles.message} ${
              message.includes("nulstillet") ? styles.success : styles.error
            }`}
          >
            {message}
          </p>
        )}

        <div className={styles.links}>
          <Link to="/login" className={styles.link}>
            Tilbage til login
          </Link>
          <Link to="/forgot-password" className={styles.link}>
            Anmod om nyt link
          </Link>
        </div>
      </form>
    </div>
  );
};

export default PasswordResetForm;
