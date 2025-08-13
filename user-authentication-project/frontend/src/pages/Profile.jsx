import { AuthDemo, useAuth } from "../auth/AuthContext/AuthContext";
import styles from "./styles.module.css";

export default function Profile() {
  return (
    <div className={styles.container}>
      <h1>Profile Page</h1>
      <AuthDemo />
    </div>
  );
}
