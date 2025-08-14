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
      setMessage("Noget gik galt. Prøv venligst igen.");
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2>Glemt Adgangskode</h2>

        <div>
          <input
            type="email"
            {...register("email", {
              required: "Email er påkrævet",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Ugyldig email",
              },
            })}
            placeholder="Indtast din email"
          />
          {errors.email && (
            <p style={{ color: "red" }}>{errors.email.message}</p>
          )}
        </div>

        <button type="submit" disabled={loading} className={styles.btnSubmit}>
          {loading ? "Sender..." : "Nulstil Adgangskode"}
        </button>

        {message && <p>{message}</p>}
      </form>
    </div>
  );
}

export default ForgotPasswordForm;
