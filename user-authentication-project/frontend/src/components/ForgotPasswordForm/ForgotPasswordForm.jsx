import { useForm } from "react-hook-form";
import { useState } from "react";
import { useAuth } from "../../auth/AuthContext/AuthContext";

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
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>Glemt Adgangskode</h2>

      <div>
        <label>Email:</label>
        <input
          type="email"
          {...register("email", {
            required: "Email er påkrævet",
            pattern: {
              value: /^\S+@\S+$/i,
              message: "Ugyldig email",
            },
          })}
        />
        {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Sender..." : "Nulstil Adgangskode"}
      </button>

      {message && <p>{message}</p>}
    </form>
  );
}

export default ForgotPasswordForm;
