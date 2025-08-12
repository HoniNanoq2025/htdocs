import styles from "./LoginForm.module.css";
import { useForm } from "react-hook-form";
import { useAuth } from "./AuthContext";

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const { login, loading } = useAuth();

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);

    if (result.success) {
      alert("Du er nu logget ind!");
      reset();
      window.location.href = "/dashboard";
    } else {
      alert(result.message || "Login mislykkedes.");
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <h2 className={styles.formHeader}>Login</h2>

      {/* Your existing input fields stay exactly the same */}
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

      <button type="submit" className={styles.submitBtn} disabled={loading}>
        {loading ? "Logger ind..." : "Login"}
      </button>
    </form>
  );
};

export default LoginForm;
