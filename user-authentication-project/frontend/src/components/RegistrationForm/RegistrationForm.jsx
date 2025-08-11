import { useForm } from "react-hook-form";
import styles from "./RegistrationForm.module.css";

const RegistrationForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = (data) => {
    console.log("Formular sendt med React Hook Form", data);
    alert("Du er nu registreret!");
    reset();
  };

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
      action="submit"
    >
      <h2 className={styles.formHeader}>Registrer dig</h2>
      <input
        {...register("name", {
          required: "Navn er påkrævet",
          minLength: {
            value: 2,
            message: "Navnet skal indeholde mindst 2 tegn",
          },
        })}
        type="text"
        placeholder="Navn"
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
            message: "Brugernavnet skal indeholde mindst 6 tegn",
          },
        })}
        type="text"
        placeholder="Brugernavn"
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
        placeholder="Adgangskode"
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

      <button type="submit" className={styles.submitBtn}>
        Registrer
      </button>
    </form>
  );
};

export default RegistrationForm;
