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
            const result = await changePassword(data.currentPassword, data.newPassword);

            if (result.success) {
                setMessage("Din adgangskode er blevet ændret! Du omdirigeres til login siden...");
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
    }
    return (
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <h2>Skift Adgangskode</h2>
        {message && <p className={styles.message}>{message}</p>}
        <div className={styles.formGroup}>
          <label htmlFor="currentPassword">Nuværende Adgangskode</label>
          <input
            type="password"
            id="currentPassword"
            {...register("currentPassword", {
              required: "Dette felt er påkrævet",
            })}
          />
          {errors.currentPassword && (
            <span className={styles.error}>
              {errors.currentPassword.message}
            </span>
          )}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="newPassword">Ny Adgangskode</label>
          <input
            {...register("newPassword", {
                required: "Dette felt er påkrævet",
                minLength: {
                    value: 8,
                    message: "Adgangskoden skal indeholde mindst 8 tegn",
                }
            })}
            type="password"
            id="newPassword"
            placeholder="Ny adgangskode (min. 8 tegn)"
            className={`${styles.input} ${errors.newPassword ? styles.inputError : ""}`}
            aria-invalid={errors.newPassword ? "true" : "false"}
          />
          {errors.newPassword && (
            <span className={styles.error}>{errors.newPassword.message}</span>
          )}
        </div>

        {/* CONFIRM NEW PASSWORD */}
        <label htmlFor="confirmPassword">Bekræft Ny Adgangskode</label>
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
        <button
          type="submit"
          disabled={loading}
          className={styles.submitButton}
        >
          {loading ? "Ændrer..." : "Skift Adgangskode"}
        </button>
      </form>
    );
}
