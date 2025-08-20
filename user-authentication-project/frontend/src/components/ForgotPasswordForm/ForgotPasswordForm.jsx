import { useForm } from "react-hook-form";
import { useState } from "react";
import { useAuth } from "../../auth/AuthContext/AuthContext";
import styles from "./ForgotPasswordForm.module.css";

function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [message, setMessage] = useState("");
  const { forgotPassword, loading } = useAuth();

  const onSubmit = async (data) => {
    try {
      const result = await forgotPassword(data.email);
      setMessage(result.message);
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <h2 className={styles.formHeader}>Forgotten Password</h2>

        <div className={styles.formGroup}>
          <input
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email",
              },
            })}
            placeholder="Type in your email..."
          />
          {errors.email && (
            <p style={{ color: "red" }}>{errors.email.message}</p>
          )}
        </div>

        <button type="submit" disabled={loading} className={styles.btnSubmit}>
          {loading ? "Sending..." : "Reset Password"}
        </button>

        {message && <p>{message}</p>}
      </form>
    </div>
  );
}

export default ForgotPasswordForm;
