import styles from "./LoginForm.module.css";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext/AuthContext";

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const { login, loading } = useAuth();

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);

    if (result.success) {
      alert("You are now logged in!");
      reset();
      navigate("/profile");
    } else {
      alert(result.message || "Login failed.");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <h2 className={styles.formHeader}>Login</h2>
        {/* Your existing input fields stay exactly the same */}
        <input
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Invalid email",
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
            required: "Password is required",
            minLength: {
              value: 8,
              message: "The password must containat least 8 characters",
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
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <div className={styles.forgotPassword}>
        <Link to="/forgot-password" className={styles.forgotPasswordLink}>
          Forgot your password?
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;
