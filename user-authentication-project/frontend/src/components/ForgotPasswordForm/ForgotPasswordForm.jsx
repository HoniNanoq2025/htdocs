import { useForm } from "react-hook-form";
import { useState } from "react";

function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [message, setMessage] = useState("");

  const onSubmit = async (data) => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/forgot-password.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();
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

      <button type="submit">Nulstil Adgangskode</button>

      {message && <p>{message}</p>}
    </form>
  );
}

export default ForgotPasswordForm;
