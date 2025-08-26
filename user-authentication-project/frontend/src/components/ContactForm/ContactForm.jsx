import { useForm } from "react-hook-form";
import styles from "./ContactForm.module.css";

const ContactForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = (data) => {
    console.log("Form sent via React Hook Form", data);
    alert("Thank you for reaching out!");
    reset();
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <h4 className={styles.heading}>
        If you have anything you want us to consider for the podcast, please get
        in touch.
      </h4>
      <input
        {...register("name", { required: "Name is required" })}
        placeholder="Name"
        className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
        aria-invalid={errors.name ? "true" : "false"}
        type="text"
      />
      {errors.name && (
        <p role="alert" className={styles.errors}>
          {errors.name.message}
        </p>
      )}

      <input
        {...register("email", {
          required: "Email is required",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Ugyldig email",
          },
        })}
        type="email"
        placeholder="Email"
        className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
        aria-invalid={errors.email ? "true" : "false"}
      />
      {errors.email && (
        <p role="alert" className={styles.errors}>
          {errors.email.message}
        </p>
      )}

      <textarea
        {...register("message", { required: "Write a message" })}
        placeholder="Your message..."
        name="message"
        id="message"
        className={`${styles.input} ${errors.message ? styles.inputError : ""}`}
        aria-invalid={errors.message ? "true" : "false"}
      />
      {errors.message && (
        <p role="alert" className={styles.errors}>
          {errors.message.message}
        </p>
      )}

      <button type="submit" className={styles.button}>
        Send
      </button>
    </form>
  );
};

export default ContactForm;
