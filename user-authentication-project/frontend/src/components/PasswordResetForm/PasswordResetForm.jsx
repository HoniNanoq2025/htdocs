import { useForm } from "react-hook-form";
import styles from "./PasswordResetForm.module.css";

const PasswordResetForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = (data) => {
    console.log("Formular sendt med React Hook Form", data);
    alert("Din adgangskode er blevet nulstillet!");
    reset();
  };

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
      action="submit"
    >
      <h2 className={styles.formHeader}>Nulstill din adgangskode:</h2>
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
          required: "Adgangskode er påkrævet",
          minLength: {
            value: 8,
            message: "Adgangskoden skal indeholde mindst 8 tegn",
          },
        })}
        type="password"
        placeholder="Den gamle adgangskode..."
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
          required: "Skal udfyldes for at nulstille adgangskode",
          minLength: {
            value: 8,
            message: "Adgangskoden skal indeholde mindst 8 tegn",
          },
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

      <button type="submit" className={styles.submitBtn}></button>
    </form>
  );
};

export default PasswordResetForm;
