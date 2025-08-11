import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";

function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [message, setMessage] = useState("");

  const onSubmit = async (data) => {
    const response = await fetch(
      "http://localhost:8000/api/reset-password.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      }
    );

    const result = await response.json();
    setMessage(result.message);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>Nulstil din adgangskode</h2>

      <div>
        <label>Ny Adgangskode:</label>
        <input
          type="password"
          {...register("password", {
            required: "Adgangskode er påkrævet",
            minLength: {
              value: 8,
              message: "Adgangskoden skal indeholde min. 8 tegn",
            },
          })}
        />
        {errors.password && (
          <p style={{ color: "red" }}>{errors.password.message}</p>
        )}
      </div>

      <div>
        <label>Bekræft adgangskode:</label>
        <input
          type="password"
          {...register("confirmPassword", {
            validate: (value) =>
              value === watch("password") || "Adgangskoderne er ikke ens",
          })}
        />
        {errors.confirmPassword && (
          <p style={{ color: "red" }}>{errors.confirmPassword.message}</p>
        )}
      </div>

      <button type="submit">Nulstil Adgangskoden</button>

      {message && <p>{message}</p>}
    </form>
  );
}

export default ResetPasswordForm;
