import { FaVolumeUp } from "react-icons/fa";
import { FaYoutube, FaPodcast, FaAudible, FaSpotify } from "react-icons/fa6";
import { FaHeart } from "react-icons/fa6";
import EpisodeReview from "../../components/EpisodeReview/EpisodeReview";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LikeCounter from "../../components/LikeCounter/LikeCounter";
import podcastLogo from "/images/recall-the-midwife-2-banner.png";
import seriesOneImage from "/images/series/01-series-one-neal-street.png";
import TypeSpecialButtons from "../../components/TypeSpecialButtons/TypeSpecialButtons";
import styles from "./Home.module.css";

export default function Home({ favorites, toggleFavorites, starColor }) {
  const [latestEpisode, setLatestEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "ReCall The Midwife - Unofficial Podcast || Home";
  }, []);

  useEffect(() => {
    const fetchLatestEpisode = async () => {
      try {
        const response = await fetch("/api/episodes.json");
        if (!response.ok) {
          throw new Error("Failed to fetch episodes data");
        }
        const episodes = await response.json();

        // Find the episode with the highest ID (latest episode)
        const latestEpisode = episodes.reduce((latest, current) =>
          current.Id > latest.Id ? current : latest
        );

        setLatestEpisode(latestEpisode);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching latest episode:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestEpisode();
  }, []);

  const handleViewAllEpisodes = () => {
    navigate("/episodes");
  };

  return (
    <main className={styles.home}>
      <section className={styles.heroContainer}>
        <div className={styles.headline}>
          <h1 className={styles.title}>
            <span className={styles.blue}>Re</span>Call The Midwife
          </h1>
        </div>
        <div className={styles.introContainer}>
          <p className={styles.introTxt}>
            An unofficial Call The Midwife podcast by 3 friends, <br />
            who are super fans of the fantastic TV series. <br />
            Join us as we review each episode from the start while having a good
            laugh.
          </p>
        </div>
        <div className={styles.audioLinksContainer}>
          <a
            href="https://shows.acast.com/recall-the-midwife"
            target="_blank"
            className={styles.audioLink}
          >
            <FaVolumeUp size={44} className={styles.icon} />
          </a>
          <a
            href="https://www.youtube.com/@recallthemidwife"
            target="_blank"
            className={styles.audioLink}
          >
            <FaYoutube size={44} className={styles.icon} />
          </a>
          <a
            href="https://podcasts.apple.com/us/podcast/recall-the-midwife/id1624307542"
            target="_blank"
            className={styles.audioLink}
          >
            <FaPodcast size={44} className={styles.icon} />
          </a>
          <a
            href="https://www.audible.co.uk/podcast/ReCall-The-Midwife/B09X1JKYCL"
            target="_blank"
            className={styles.audioLink}
          >
            <FaAudible size={44} className={styles.icon} />
          </a>
          <a
            href="https://open.spotify.com/show/2gs6EoRJGjBgXzO7WLke4h?si=4677f37bae524254"
            target="_blank"
            className={styles.audioLink}
          >
            <FaSpotify size={44} className={styles.icon} />
          </a>
        </div>
        <div className={styles.podcastLogo}>
          <img
            src={podcastLogo}
            alt="logo for Recall The Midwife - The Unofficial Podcast"
            className={styles.logo}
          />
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
      <section className={styles.firstLastestEpisodeContainer}>
        <div className={`${styles.firstEpisode} ${styles.card}`}>
          <div className={styles.imageContainer}>
            <div
              className={styles.image}
              style={{
                // Inline styles object - fallback til thumbnail hvis images array er tomt
                backgroundImage: `url(${seriesOneImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
              // Accessibility attributter til skærmlæsere
              role="img"
              aria-label="The first podcast episode"
            />
            <button
              className={styles.readMoreBtn}
              aria-label="Click to read more about this episode"
              onClick={() => navigate("/episodes/0")}
            >
              Read more
            </button>
          </div>
          <div className={styles.redContainer}>
            <div className={styles.likesContainer}>
              <button
                aria-label={favorites.includes(1) ? "Unlike" : "Like"}
                onClick={() => toggleFavorites(1)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FaHeart
                  size={24}
                  style={{
                    color: favorites.includes(1)
                      ? "var(--lightblue)"
                      : "var(--light)",
                    transition: "color 0.2s",
                  }}
                />
              </button>
              {/* Like counter for episode ID 1 */}
              <LikeCounter episodeId={0} initialLikes={0} />
            </div>
            <div className={styles.reviewContainer}>
              <p>Review</p>
              <EpisodeReview episodeId={0} />
            </div>
          </div>
          <div className={styles.episodeDescription}>
            <h3 className={styles.episodeTitle}>First Episode</h3>
            <details className={styles.episodeDetails}>
              <summary className={styles.episodeSummary}>
                Click to read episode summary.
              </summary>
              <p className={styles.episodeTxt}>
                The first-ever episode of ReCall The Midwife, where we discuss
                each episode in humorous detail! <br />
                Here is Episode 1 of Series 1 - Jenny Lee arrives in Poplar and
                to her shock a convent!
              </p>
            </details>
          </div>
          <div className={styles.iFrameContainer}>
            <iframe
              src="https://embed.acast.com/$/627fcce9d3a4110014f1782a/series-1-episode-1?"
              frameBorder="0"
              width="100%"
              height="100px"
            ></iframe>
          </div>
        </div>

        {/* Latest Episode Card */}
        <div className={`${styles.latestEpisode} ${styles.card}`}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <p>Loading latest episode...</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <p>Error loading latest episode: {error}</p>
            </div>
          ) : latestEpisode ? (
            <>
              <div className={styles.imageContainer}>
                <div
                  className={styles.image}
                  style={{
                    backgroundImage: `url(${latestEpisode.Image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                  role="img"
                  aria-label={`${latestEpisode.Title} episode thumbnail`}
                />
                <button
                  className={styles.readMoreBtn}
                  aria-label="Click to read more about this episode"
                  onClick={() => navigate(`/episodes/${latestEpisode.Id}`)}
                >
                  Read more
                </button>
              </div>
              <div className={styles.redContainer}>
                <div className={styles.likesContainer}>
                  <button
                    aria-label={
                      favorites.includes(latestEpisode.Id) ? "Unlike" : "Like"
                    }
                    onClick={() => toggleFavorites(latestEpisode.Id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <FaHeart
                      size={24}
                      style={{
                        color: favorites.includes(latestEpisode.Id)
                          ? "var(--lightblue)"
                          : "var(--light)",
                        transition: "color 0.2s",
                      }}
                    />
                  </button>
                  {/* Like counter for latest episode */}
                  <LikeCounter episodeId={latestEpisode.Id} initialLikes={0} />
                </div>
                <div className={styles.reviewContainer}>
                  <p>Review</p>
                  <EpisodeReview episodeId={latestEpisode.Id} />
                </div>
              </div>
              <div className={styles.episodeDescription}>
                <h3 className={styles.episodeTitle}>{latestEpisode.Title}</h3>
                <details className={styles.episodeDetails}>
                  <summary className={styles.episodeSummary}>
                    Click to read episode summary.
                  </summary>
                  <p className={styles.episodeTxt}>{latestEpisode.Summary}</p>
                </details>
              </div>
              <div className={styles.iFrameContainer}>
                <iframe
                  src={latestEpisode.iFrameLink}
                  frameBorder="0"
                  width="100%"
                  height="100px"
                ></iframe>
              </div>
            </>
          ) : (
            <div className={styles.noEpisodeContainer}>
              <p>No episodes available</p>
            </div>
          )}
        </div>
      </section>
      <div className={styles.buttonContainer}>
        <button
          className={styles.episodeListLinkBtn}
          onClick={handleViewAllEpisodes}
          aria-label="View all episodes"
        >
          View all episodes
        </button>
      </div>
      <TypeSpecialButtons />
    </main>
  );
}
