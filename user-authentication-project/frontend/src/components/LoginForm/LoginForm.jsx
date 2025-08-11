import styles from "./LoginForm.module.css";
import { useForm } from "react-hook-form";

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = (data) => {
    console.log("Formular sendt med React Hook Form", data);
    alert("Du er nu logget ind!");
    reset();
  };

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
      action="submit"
    >
      <h2 className={styles.formHeader}>Login</h2>
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
        Login
      </button>
    </form>
  );
};

export default LoginForm;
