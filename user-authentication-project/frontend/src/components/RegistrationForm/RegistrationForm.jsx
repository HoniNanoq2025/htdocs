import { useForm } from "react-hook-form";
import { useAuth } from "../../auth/AuthContext/AuthContext";
import styles from "./RegistrationForm.module.css";

const RegistrationForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const { register: registerUser, loading } = useAuth();

  const onSubmit = async (data) => {
    try {
      const result = await registerUser(
        data.username,
        data.email,
        data.password
      );

      if (result.success) {
        alert("Du er nu registreret!");
        reset();
        window.location.href = "/login"; // Redirect to login after successful registration
      } else {
        alert(result.message || "Registrering mislykkedes.");
      }
    } catch (error) {
      alert("Der opstod en fejl. Prøv venligst igen.");
    }
  };

  return (
    <div className={styles.registrationContainer}>
      <form
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
        action="submit"
      >
        <h2 className={styles.formHeader}>Create account</h2>
        <input
          {...register("name", {
            required: "Navn er påkrævet",
            minLength: {
              value: 2,
              message: "Navnet skal indeholde mindst 2 tegn",
            },
          })}
          type="text"
          placeholder="Your name"
          className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
        />
        {errors.name && (
          <p role="alert" className={styles.errors}>
            {errors.name.message}
          </p>
        )}

        <input
          {...register("username", {
            required: "Brugernavn er påkrævet",
            minLength: {
              value: 3,
              message: "Brugernavnet skal indeholde mindst 3 tegn",
            },
          })}
          type="text"
          placeholder="Username"
          className={`${styles.input} ${
            errors.username ? styles.inputError : ""
          }`}
        />
        {errors.username && (
          <p role="alert" className={styles.errors}>
            {errors.username.message}
          </p>
        )}

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

        <input
          {...register("password", {
            required: "Adgangskode er påkrævet",
            minLength: {
              value: 8,
              message: "Adgangskoden skal indeholde mindst 8 tegn",
            },
          })}
          type="password"
          placeholder="Password"
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

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? "Registrerer..." : "Registrer"}
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;
