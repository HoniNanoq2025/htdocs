import { useForm } from "react-hook-form";
import { useState } from "react";
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
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:8000/api/reset-password.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: data.email,
            oldPassword: data.password,
            newPassword: data.newPassword,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage("Din adgangskode er blevet nulstillet!");
        reset();
      } else {
        setMessage(result.message || "Fejl ved nulstilling af adgangskode");
      }
    } catch (error) {
      setMessage("Der opstod en fejl. Prøv venligst igen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
      action="submit"
    >
      <h2 className={styles.formHeader}>Nulstil din adgangskode</h2>

      {/* INPUT EMAIL */}
      <input
        {...register("email", {
          required: "Email er påkrævet",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Ugyldig email",
          },
        })}
        type="email"
        placeholder="E-mail"
        className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
        aria-invalid={errors.email ? "true" : "false"}
      />
      {errors.email && (
        <p role="alert" className={styles.errors}>
          {errors.email.message}
        </p>
      )}

      {/* INPUT OLD PASSWORD */}
      <input
        {...register("password", {
          required: "Nuværende adgangskode er påkrævet",
          minLength: {
            value: 8,
            message: "Adgangskoden skal indeholde mindst 8 tegn",
          },
        })}
        type="password"
        placeholder="Nuværende adgangskode..."
        className={`${styles.input} ${
          errors.password ? styles.inputError : ""
        }`}
        aria-invalid={errors.password ? "true" : "false"}
      />
      {errors.password && (
        <p role="alert" className={styles.errors}>
          {errors.password.message}
        </p>
      )}

      {/* INPUT NEW PASSWORD */}
      <input
        {...register("newPassword", {
          required: "Ny adgangskode er påkrævet",
          minLength: {
            value: 8,
            message: "Adgangskoden skal indeholde mindst 8 tegn",
          },
          validate: (value) =>
            value !== watch("password") ||
            "Ny adgangskode skal være forskellig fra den nuværende",
        })}
        type="password"
        placeholder="Ny adgangskode (min. 8 tegn)"
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
    </form>
  );
};

export default PasswordResetForm;