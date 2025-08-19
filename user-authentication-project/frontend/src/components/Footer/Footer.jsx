import {
  FaRegEnvelope,
  FaFacebook,
  FaXTwitter,
  FaBluesky,
  FaInstagram,
  FaSquareThreads,
  FaRegCopyright,
} from "react-icons/fa6";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.socialIcons}>
          <a href="mailto:Recallthemidwife@gmail.com">
            <FaRegEnvelope size={24} />
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=615663239709856"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebook size={24} />
          </a>
          <a
            href="https://x.com/RECallthemidPod"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaXTwitter size={24} />
          </a>
          <a
            href="https://bsky.app/profile/recallthemidwife.bsky.social"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaBluesky size={24} />
          </a>
          <a
            href="https://www.instagram.com/recallthemidwifepodcast/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram size={24} />
          </a>
          <a
            href="https://www.threads.com/@recallthemidwifepodcast"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaSquareThreads size={24} />{" "}
          </a>
        </div>

        <p>
          <FaRegCopyright size={12} /> Copyright 2025 HoniNanoq
        </p>
      </div>
    </footer>
  );
}
