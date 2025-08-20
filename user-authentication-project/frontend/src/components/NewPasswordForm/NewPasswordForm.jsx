import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext/AuthContext";
import styles from "./newPasswordForm.module.css";

const NewPasswordForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm();

  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { changePassword, loading } = useAuth();

  const onSubmit = async (data) => {
    try {
      const result = await changePassword(
        data.currentPassword,
        data.newPassword
      );

      if (result.success) {
        setMessage(
          "Your password has been changed! You vil be redirected to the login page..."
        );
        reset();
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setMessage(result.message || "Fejl ved ændring af adgangskode");
      }
    } catch (error) {
      console.error("Change password error:", error);
      setMessage("Der opstod en fejl. Prøv venligst igen.");
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <h2 className={styles.formHeader}>Change Your Password</h2>
      {message && <p className={styles.message}>{message}</p>}
      <div className={styles.formGroup}>
        <label htmlFor="currentPassword">Current Password</label>
        <input
          type="password"
          id="currentPassword"
          {...register("currentPassword", {
            required: "Required!",
          })}
          placeholder="Current password"
        />
        {errors.currentPassword && (
          <span className={styles.error}>{errors.currentPassword.message}</span>
        )}
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="newPassword">New Password</label>
        <input
          {...register("newPassword", {
            required: "Required!",
            minLength: {
              value: 8,
              message: "Password must contain at least 8 characters",
            },
          })}
          type="password"
          id="newPassword"
          placeholder="New password (min. 8 characters)"
          className={`${styles.input} ${
            errors.newPassword ? styles.inputError : ""
          }`}
          aria-invalid={errors.newPassword ? "true" : "false"}
        />
        {errors.newPassword && (
          <span className={styles.error}>{errors.newPassword.message}</span>
        )}
      </div>

      {/* CONFIRM NEW PASSWORD */}
      <div className={styles.formGroup}>
        <label htmlFor="confirmPassword">Confirm New Password</label>
        <input
          {...register("confirmPassword", {
            required: "Required!",
            validate: (value) =>
              value === watch("newPassword") ||
              "The passwords are not the same",
          })}
          type="password"
          placeholder="Confirm new password"
          className={`${styles.input} ${
            errors.confirmPassword ? styles.inputError : ""
          }`}
          aria-invalid={errors.confirmPassword ? "true" : "false"}
        />
        {errors.confirmPassword && (
          <p role="alert" className={styles.error}>
            {errors.confirmPassword.message}
          </p>
        )}
      </div>
      <button type="submit" disabled={loading} className={styles.submitButton}>
        {loading ? "Changing..." : "Change Password"}
      </button>
    </form>
  );
};
export default NewPasswordForm;
