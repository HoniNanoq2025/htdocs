import { AuthDemo } from "../auth/AuthContext/AuthContext";
import NewPasswordForm from "../components/NewPasswordForm/NewPasswordForm";
import DeleteProfile from "../components/DeleteProfile/DeleteProfile";
import { Link } from "react-router-dom";
import styles from "./styles.module.css";

export default function Profile() {
  return (
    <div className={styles.container}>
      <h1>Profile Page</h1>
      <AuthDemo />
      <div className={styles.containerForm}>
        <NewPasswordForm />
      </div>
      <div className={styles.deleteProfileLink}>
        <Link path="/delete-profile" className={styles.deleteLink}>
          Delete my profile
        </Link>
      </div>
    </div>
  );
}
