import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight, FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { IoTimeSharp, IoCalendarSharp } from "react-icons/io5";
import EpisodeReview from "../EpisodeReview/EpisodeReview";
import Comments from "../Comments/Comments";
import styles from "./EpisodeDetail.module.css";

export default function EpisodeDetail({ favorites, toggleFavorites }) {
  const { Id } = useParams();
  const navigate = useNavigate();
  const [episode, setEpisode] = useState(null);
  const [allEpisodes, setAllEpisodes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const formatDuration = (episodeLength) => {
    if (!episodeLength) return "00:00:00";

    const { hours = 0, minutes = 0, seconds = 0 } = episodeLength;

    const formatNumber = (num) => num.toString().padStart(2, "0");

    return `${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(
      seconds
    )}`;
  };

  useEffect(() => {
    const fetchEpisode = async () => {
      try {
        const response = await fetch("/api/episodes.json");
        const data = await response.json();

        // Store all episodes and find current episode
        setAllEpisodes(data);
        const foundEpisode = data.find((ep) => ep.Id === parseInt(Id));
        setEpisode(foundEpisode);

        // Find the current episode's index in the array
        const index = data.findIndex((ep) => ep.Id === parseInt(Id));
        setCurrentIndex(index);
      } catch (error) {
        console.error("Error fetching episode:", error);
      }
    };
    fetchEpisode();
  }, [Id]);

  useEffect(() => {
    if (episode) {
      document.title = `Season ${episode.Season}, Episode ${episode.PodcastEpisode} || ReCall The Midwife - Unofficial Podcast`;
    }
  }, [episode]);

  const goToPreviousEpisode = () => {
    if (currentIndex > 0) {
      const previousEpisode = allEpisodes[currentIndex - 1];
      navigate(`/episodes/${previousEpisode.Id}`);
    }
  };

  const goToNextEpisode = () => {
    if (currentIndex < allEpisodes.length - 1) {
      const nextEpisode = allEpisodes[currentIndex + 1];
      navigate(`/episodes/${nextEpisode.Id}`);
    }
  };

  if (!episode) return <p>Loading...</p>;

  const isFavorite = favorites.includes(episode.Id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allEpisodes.length - 1;

  return (
    <main className={styles.episodeDetail}>
      <section className={styles.heroContainerDetails}>
        <div className={styles.headlineDetails}>
          <h1>EPISODE DETAIL</h1>
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
      <section className={styles.episodeDetailContainer}>
        <div className={styles.mobileView}>
          <div className={styles.episodeCard}>
            <div className={styles.timeInfo}>
              <div className={styles.episodeDuration}>
                <IoTimeSharp /> {formatDuration(episode.EpisodeLength)}
              </div>
              <div className={styles.episodeAirDate}>
                <IoCalendarSharp /> {episode.DatePublished}
              </div>
            </div>
            <div className={styles.detailImageContainer}>
              <div
                className={styles.image}
                style={{
                  backgroundImage: `url(${episode.Image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
                role="img"
                aria-label={`Call the Midwife series ${episode.Series} promo picture`}
              />
              {/* Favorit toggle knap - kalder toggleFavorites prop funktion */}
              <button
                onClick={() => toggleFavorites(episode.Id)}
                className={`${styles.favoriteBtn} ${
                  isFavorite ? styles.favorited : ""
                }`}
                aria-label={
                  isFavorite ? "Fjern fra favoritter" : "Tilføj til favoritter"
                }
              >
                {isFavorite ? (
                  <FaHeart size={22} color="#961F3B" />
                ) : (
                  <FaRegHeart size={22} color="#961F3B" />
                )}
              </button>
            </div>
            <div className={styles.podcastReference}>
              <p>
                Season {episode.Season}, Episode {episode.PodcastEpisode}
              </p>
            </div>
            <div className={styles.episodeTitle}>
              <h2>{episode.Title}</h2>
            </div>
            <div className={styles.episodeDescription}>
              <p className={styles.text}>
                Join us, Bex, Alex (two Brits), and Jenn (an American)—three
                Call The Midwife super fans—as we rewatch our favourite show and
                discuss each episode in order. Why not join us? Watch the
                relevant episode, and then listen to us!
              </p>
              <p className={styles.text}>{episode.Summary}</p>
              <p className={styles.text}>
                Please follow us on Instagram @recallthemidwifepodcast, on
                Facebook @Recallthemidwife, on Twitter/X @RECallthemidPod,
                Threads @recallthemidwifepodcast, subscribe to our YouTube
                channel https://www.youtube.com/@recallthemidwife or e-mail us
                at Recallthemidwife@gmail.com with any questions, suggestions,
                ideas or feedback!
              </p>
            </div>
            <div className={styles.iFrameContainer}>
              <iframe
                src={episode.iFrameLink}
                frameBorder="0"
                width="100%"
                height="100px"
              ></iframe>
            </div>
            <div className={styles.reviewContainerDetails}>
              <p>Please review this episode</p>
              <EpisodeReview
                episodeId={episode.Id}
                starColor="var(--darkblue)"
              />
            </div>
          </div>

          {/* MOBILE BUTTONS */}
          <div className={styles.mobileButtons}>
            <button
              className={styles.shuffleBtn}
              onClick={goToPreviousEpisode}
              disabled={!hasPrevious}
              aria-label="Go to previous episode"
            >
              <FaChevronLeft size={40} />
            </button>
            <button
              className={styles.shuffleBtn}
              onClick={goToNextEpisode}
              disabled={!hasNext}
              aria-label="Go to next episode"
            >
              <FaChevronRight size={40} />
            </button>
          </div>
        </div>

        {/* DESKTOP VIEW */}
        <div className={styles.desktopView}>
          <div className={styles.previousEpisode}>
            <button
              className={styles.shuffleBtn}
              onClick={goToPreviousEpisode}
              disabled={!hasPrevious}
              aria-label="Go to previous episode"
            >
              <FaChevronLeft size={40} />
            </button>
          </div>
          <div className={styles.episodeCard}>
            <div className={styles.cardLeftSide}>
              <div className={styles.timeInfo}>
                <div className={styles.episodeDuration}>
                  <IoTimeSharp /> {formatDuration(episode.EpisodeLength)}
                </div>
                <div className={styles.episodeAirDate}>
                  <IoCalendarSharp /> {episode.DatePublished}
                </div>
              </div>
              <div className={styles.detailImageContainer}>
                <div
                  className={styles.image}
                  style={{
                    backgroundImage: `url(${episode.Image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                  role="img"
                  aria-label={`Call the Midwife series ${episode.Series} promo picture`}
                />
                {/* Favorit toggle knap - kalder toggleFavorites prop funktion */}
                <button
                  onClick={() => toggleFavorites(episode.Id)}
                  className={`${styles.favoriteBtn} ${
                    isFavorite ? styles.favorited : ""
                  }`}
                  aria-label={
                    isFavorite
                      ? "Fjern fra favoritter"
                      : "Tilføj til favoritter"
                  }
                >
                  {isFavorite ? (
                    <FaHeart size={22} color="#961F3B" />
                  ) : (
                    <FaRegHeart size={22} color="#961F3B" />
                  )}
                </button>
              </div>
              <div className={styles.iFrameContainer}>
                <iframe
                  src={episode.iFrameLink}
                  frameBorder="0"
                  width="100%"
                  height="100px"
                ></iframe>
              </div>
            </div>
            <div className={styles.cardRightSide}>
              <div className={styles.podcastReference}>
                <p>
                  Season {episode.Season}, Episode {episode.PodcastEpisode}
                </p>
              </div>
              <div className={styles.episodeTitle}>
                <h2>{episode.Title}</h2>
              </div>
              <div className={styles.episodeDescription}>
                <p className={styles.text}>
                  Join us, Bex, Alex (two Brits), and Jenn (an American)—three
                  Call The Midwife super fans—as we rewatch our favourite show
                  and discuss each episode in order. Why not join us? Watch the
                  relevant episode, and then listen to us!
                </p>
                <p className={styles.text}>{episode.Summary}</p>
                <p className={styles.text}>
                  Please follow us on Instagram @recallthemidwifepodcast, on
                  Facebook @Recallthemidwife, on Twitter/X @RECallthemidPod,
                  Threads @recallthemidwifepodcast, subscribe to our YouTube
                  channel https://www.youtube.com/@recallthemidwife or e-mail us
                  at Recallthemidwife@gmail.com with any questions, suggestions,
                  ideas or feedback!
                </p>
              </div>
              <div className={styles.reviewContainerDetails}>
                <p>Please review this episode</p>
                <EpisodeReview
                  episodeId={episode.Id}
                  starColor="var(--darkblue)"
                />
              </div>
              <hr></hr>
              <div className={styles.commentSection}>
                <Comments episodeId={episode.Id} />
              </div>
            </div>
          </div>
          <div className={styles.nextEpisode}>
            <button
              className={styles.shuffleBtn}
              onClick={goToNextEpisode}
              disabled={!hasNext}
              aria-label="Go to next episode"
            >
              <FaChevronRight size={40} />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
