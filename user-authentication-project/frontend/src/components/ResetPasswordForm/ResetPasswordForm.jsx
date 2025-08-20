import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext/AuthContext";
import styles from "./ResetPasswordForm.module.css";

const ResetPasswordForm = () => {
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
        "Invalid or missing token. Please request a new link."
      );
    }
  }, [token]);

  const onSubmit = async (data) => {
    if (!token) {
      setMessage("Invalid token. Please request a new link.");
      return;
    }

    try {
      const result = await resetPassword(token, data.newPassword);

      if (result.success) {
        setMessage(
          "Your password has been reset! You will be redirected to the login page..."
        );
        reset();
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setMessage(result.message || "Error when resetting password");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setMessage("An error occured. Please try again.");
    }
  };

  // If no token, show error state
  if (!token) {
    return (
      <div className={styles.container}>
        <div className={styles.form}>
          <h2 className={styles.formHeader}>Reset Password</h2>
          <p className={styles.error}>This link is invalid or expired.</p>
          <Link to="/forgot-password" className={styles.link}>
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.containerForm}>
      <form
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
        action="submit"
      >
        <h2 className={styles.formHeader}>Reset Your Password</h2>

        {/* INPUT NEW PASSWORD */}
        <input
          {...register("newPassword", {
            required: "New password is required",
            minLength: {
              value: 8,
              message: "The password must containat least 8 characters",
            },
          })}
          type="password"
          placeholder="New password (min. 8 characters)"
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
            required: "Confirmation of password is required",
            validate: (value) =>
              value === watch("newPassword") ||
              "The passwords do match!",
          })}
          type="password"
          placeholder="Confirm new password"
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

        <button
          type="submit"
          className={styles.resetSubmitBtn}
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        {message && (
          <p
            className={`${styles.message} ${
              message.includes("reset") ? styles.success : styles.error
            }`}
          >
            {message}
          </p>
        )}

        <div className={styles.links}>
          <Link to="/login" className={styles.link}>
            Back to Login
          </Link>
          <Link to="/forgot-password" className={styles.link}>
            Request new link
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
