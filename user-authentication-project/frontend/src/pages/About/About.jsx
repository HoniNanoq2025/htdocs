import { useEffect } from "react";
import styles from "./About.module.css";
import bbcSpecial from "/images/specials/BBC-CTM-Fan-stories.png";
import { useNavigate } from "react-router-dom";

export default function About() {
  useEffect(() => {
    document.title = "About Us || Recall The Midwife - an unofficial podcast";
  }, []);

  const navigate = useNavigate();

  return (
    <main id="about" className={styles.about}>
      <section className={styles.heroContainerAbout}>
        <div className={styles.headlineAbout}>
          <h1>ABOUT US</h1>
        </div>
      </section>
      <div className={styles.customShapeDividerBottom}>
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            className={styles.shapeFill}
          ></path>
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
            className={styles.shapeFill}
          ></path>
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            className={styles.shapeFill}
          ></path>
        </svg>
      </div>
      <section className={styles.aboutInfoSection}>
        <div className={styles.aboutInfoContainer}>
          <p className={styles.aboutTxt}>
            ReCall The Midwife is an unoffical podcast and we are 3 friends, who
            are super fans of the fantastic Call The Midwife TV series.
          </p>
          <p className={styles.aboutTxt}>
            Join us - Bex, Alex (two Brits), and Jenn (an American) - as we
            review each episode from the start while having a good laugh.
          </p>
          <p>Please follow us on:</p>
          <ul className={styles.aboutSoMeList}>
            <li>
              <a
                href="https://www.instagram.com/recallthemidwifepodcast/"
                target="_blank"
                aria-label="Link to Instagram profile"
              >
                Instagram
              </a>
              : @recallthemidwifepodcast,
            </li>
            <li>
              <a
                href="https://www.facebook.com/profile.php?id=615663239709856"
                target="_blank"
                aria-label="Link to Facebook profile"
              >
                Facebook
              </a>
              : @Recallthemidwifepodcast,
            </li>
            <li>
              <a
                href="https://bsky.app/profile/recallthemidwife.bsky.social"
                target="_blank"
                aria-label="Link to BlueSky profile"
              >
                BlueSky
              </a>
              : @recallthemidwife.bsky.social,
            </li>
            <li>
              <a
                href="https://x.com/RECallthemidPod"
                target="_blank"
                aria-label="Link to Twitter/X profile"
              >
                Twitter/X
              </a>
              : @RECallthemidPod
            </li>
            <li>
              <a
                href="https://www.threads.com/@recallthemidwifepodcast"
                target="_blank"
                aria-label="Link to Threads profile"
              >
                Threads
              </a>
              : @recallthemidwifepodcast
            </li>
            <li>
              <a
                href="https://www.youtube.com/@recallthemidwife"
                target="_blank"
                aria-label="Link to YouTube page"
              >
                YouTube
              </a>
              : @recallthemidwife
            </li>
          </ul>
          <p className={styles.aboutTxt}>
            You can reach us on any of the above mentioned platforms, or you can
            reach out to us via e-mail at Recallthemidwife@gmail.com. Feel free
            to contact us with any questions, suggestions, ideas or feedback!
          </p>
          <p className={styles.aboutTxt}>
            You can also check out this interview, that Alex did for the BBC:
          </p>
          <div className={styles.bbcFanStoriesLink}>
            <a
              href="https://canvas-story.bbcrewind.co.uk/fansstories/"
              aria-label="Link to BBC Fan Stories"
            >
              <img
                src={bbcSpecial}
                alt="Screenshot from Alex's BBC Fan Stories interview"
              />
            </a>
          </div>
          <div className={styles.linkButtons}>
            <button
              className={styles.linkBtn}
              onClick={() =>
                window.open(
                  "https://www.redbubble.com/people/ReCallTheMidPod/shop",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            >
              Merchandise
            </button>
            <button
              className={styles.linkBtn}
              onClick={() => navigate("/episodes")}
            >
              Listen to our Podcast
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
