
// src/pages/MovieExplorer.js (ทำแบบเดียวกันกับหน้าอื่นๆ)
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/MovieExplorer.css";

const PLAN_LIMITS = {
  guest: 0,
  free: 5,
  medium: 60,
  premium: 300,
};

const MOVIES = [
  {
    id: 1,
    title: "Dune",
    genre: "Sci-fi",
    year: 2021,
    runtime: "155 min",
    director: "Denis Villeneuve",
    score: 8.0,
    imageUrl: "https://img.scope.dev/1.jpg",
    synopsis:
      "A noble family becomes embroiled in a war for the desert planet Arrakis, sole source of the most valuable substance in the universe.",
  },
  {
    id: 2,
    title: "Inception",
    genre: "Sci-fi",
    year: 2010,
    runtime: "148 min",
    director: "Christopher Nolan",
    score: 8.8,
    imageUrl: "https://img.scope.dev/2.jpg",
    synopsis:
      "A thief who steals secrets through dream-sharing technology is offered a chance to erase his past.",
  },
  {
    id: 3,
    title: "The Conjuring",
    genre: "Horror",
    year: 2013,
    runtime: "112 min",
    director: "James Wan",
    score: 7.5,
    imageUrl: "https://img.scope.dev/3.jpg",
    synopsis:
      "Paranormal investigators help a family terrorized by a dark presence in their farmhouse.",
  },
  {
    id: 4,
    title: "Parasite",
    genre: "Drama",
    year: 2019,
    runtime: "132 min",
    director: "Bong Joon Ho",
    score: 8.5,
    imageUrl: "https://img.scope.dev/4.jpg",
    synopsis:
      "A struggling family schemes its way into the lives of a wealthy household with unexpected consequences.",
  },
  {
    id: 5,
    title: "Mad Max: Fury Road",
    genre: "Action",
    year: 2015,
    runtime: "120 min",
    director: "George Miller",
    score: 8.1,
    imageUrl: "https://img.scope.dev/5.jpg",
    synopsis:
      "In a desert wasteland, two rebels flee a tyrant in a high-speed fight for survival.",
  },
  {
    id: 6,
    title: "Interstellar",
    genre: "Sci-fi",
    year: 2014,
    runtime: "169 min",
    director: "Christopher Nolan",
    score: 8.7,
    imageUrl: "https://img.scope.dev/6.jpg",
    synopsis:
      "Explorers travel through a wormhole to find a new home for humanity as Earth fades.",
  },
  {
    id: 7,
    title: "Get Out",
    genre: "Horror",
    year: 2017,
    runtime: "104 min",
    director: "Jordan Peele",
    score: 7.8,
    imageUrl: "https://img.scope.dev/7.jpg",
    synopsis:
      "A weekend visit to meet a partner's family reveals a terrifying hidden reality.",
  },
  {
    id: 8,
    title: "La La Land",
    genre: "Romance",
    year: 2016,
    runtime: "128 min",
    director: "Damien Chazelle",
    score: 8.0,
    imageUrl: "https://img.scope.dev/8.jpg",
    synopsis:
      "An aspiring actress and a jazz musician fall in love while chasing their dreams in Los Angeles.",
  },
  {
    id: 9,
    title: "Whiplash",
    genre: "Drama",
    year: 2014,
    runtime: "106 min",
    director: "Damien Chazelle",
    score: 8.5,
    imageUrl: "https://img.scope.dev/9.jpg",
    synopsis:
      "A young drummer pushes himself under a ruthless instructor in pursuit of greatness.",
  },
  {
    id: 10,
    title: "John Wick",
    genre: "Action",
    year: 2014,
    runtime: "101 min",
    director: "Chad Stahelski",
    score: 7.4,
    imageUrl: "https://img.scope.dev/10.jpg",
    synopsis:
      "A retired assassin returns to the underworld after losing the last gift from his wife.",
  },
];

const DetailRow = ({ label, value, locked }) => (
  <div className="movie-detail-row">
    <dt>{label}</dt>
    <dd className={locked ? "is-locked-text" : ""}>{value}</dd>
  </div>
);

export default function MovieExplorer() {
  const [plan, setPlan] = useState("free");
  const [usedQuota, setUsedQuota] = useState(0);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("all");
  const [sort, setSort] = useState("default");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isGuestPreview, setIsGuestPreview] = useState(false);

  const quotaLimit = PLAN_LIMITS[plan];
  const isRateLimited = usedQuota >= quotaLimit && plan !== "guest";
  const isFreePlan = plan === "free";
  const canUseFullDataset = plan !== "guest";
  const hasAdvancedTools = plan === "medium" || plan === "premium";

  const genres = useMemo(
    () => ["all", ...Array.from(new Set(MOVIES.map((movie) => movie.genre)))],
    []
  );

  const visibleMovies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = MOVIES.filter((movie) => {
      const matchesQuery =
        !normalizedQuery ||
        movie.title.toLowerCase().includes(normalizedQuery) ||
        movie.genre.toLowerCase().includes(normalizedQuery) ||
        String(movie.year).includes(normalizedQuery);

      const matchesGenre = genre === "all" || movie.genre === genre;

      return matchesQuery && matchesGenre;
    });

    if (sort === "score-desc") {
      result.sort((a, b) => b.score - a.score);
    }

    if (sort === "score-asc") {
      result.sort((a, b) => a.score - b.score);
    }

    return canUseFullDataset ? result : result.slice(0, 4);
  }, [canUseFullDataset, genre, query, sort]);

  const requestDemo = (callback) => {
    if (plan === "guest") {
      setShowLoginPrompt(true);
      return;
    }

    if (usedQuota >= quotaLimit) {
      return;
    }

    setUsedQuota((current) => current + 1);
    callback();
  };

  const openMovie = (movie) => {
    requestDemo(() => setSelectedMovie(movie));
  };

  const handleSearchChange = (event) => {
    setQuery(event.target.value);
    requestDemo(() => {});
  };

  const handleReset = () => {
    setUsedQuota(0);
    setSelectedMovie(null);
  };

  const lockedSynopsis =
    "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx xxxxxxxxxxxxxxxx";

  return (
    <main className="movie-explorer">
      {isGuestPreview && (
        <div className="explorer-signup-banner">
          Want to build your own movie app? Sign up now to get your free API key
          and start making 5 requests per minute!
        </div>
      )}

      <section className="explorer-toolbar" aria-label="Movie filters">
        <input
          className="explorer-search"
          value={query}
          onChange={handleSearchChange}
          placeholder={
            hasAdvancedTools
              ? "Search by title, genre, year......."
              : "Search by title..."
          }
        />

        <select
          className="explorer-select"
          value={genre}
          onChange={(event) => setGenre(event.target.value)}
        >
          {genres.map((item) => (
            <option key={item} value={item}>
              {item === "all" ? "All genres" : item}
            </option>
          ))}
        </select>

        {hasAdvancedTools && (
          <select
            className="explorer-select"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="default">Sort: default</option>
            <option value="score-desc">Score: high to low</option>
            <option value="score-asc">Score: low to high</option>
          </select>
        )}

        <select
          className="explorer-select explorer-plan"
          value={plan}
          onChange={(event) => {
            setPlan(event.target.value);
            setUsedQuota(0);
            setSelectedMovie(null);
            setIsGuestPreview(event.target.value === "guest");
          }}
        >
          <option value="guest">Guest</option>
          <option value="free">Free</option>
          <option value="medium">Medium</option>
          <option value="premium">Premium</option>
        </select>

        <div className="quota-counter">
          Quota: {usedQuota}/{quotaLimit}
        </div>

        <button className="toolbar-reset" onClick={handleReset}>
          Reset
        </button>
      </section>

      {isRateLimited ? (
        <section className="rate-limit-panel" role="alert">
          <h1>429</h1>
          <strong>Rate limit exceeded</strong>
          <p>
            You have used all {quotaLimit} requests for this minute. Upgrade for
            a higher rate limit.
          </p>
          <div className="rate-limit-actions">
            <button onClick={handleReset}>Reset quota (demo)</button>
            <Link to="/register">View plans</Link>
          </div>
        </section>
      ) : (
        <>
          <section className="movie-grid" aria-label="Movies">
            {visibleMovies.map((movie, index) => (
              <button
                key={movie.id}
                className="movie-tile"
                onClick={() => openMovie(movie)}
                type="button"
              >
                <div
                  className={`movie-poster ${
                    isGuestPreview && index === 3 ? "poster-locked" : ""
                  }`}
                />
                <span>{isGuestPreview && index === 3 ? "xxxxx" : movie.title}</span>
                <small>{isGuestPreview && index === 3 ? "xxxxx" : movie.genre}</small>
                <small className="movie-score">
                  {isGuestPreview && index === 3 ? "x.x" : movie.score.toFixed(1)}
                </small>
              </button>
            ))}
          </section>

          {isGuestPreview && (
            <section className="guest-unlock">
              <p>
                Showing 4 of {MOVIES.length} films. Login to access the full
                database.
              </p>
              <Link to="/register">Sign up free to unlock all -&gt;</Link>
            </section>
          )}
        </>
      )}

      {selectedMovie && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedMovie(null)}
          role="presentation"
        >
          <section
            className="movie-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="movie-detail-title"
          >
            <button
              className="modal-close"
              onClick={() => setSelectedMovie(null)}
              aria-label="Close movie detail"
            >
              &times;
            </button>

            <h2 id="movie-detail-title">{selectedMovie.title}</h2>
            <p className="movie-id">ID : {selectedMovie.id}</p>
            <p className={isFreePlan ? "synopsis-locked" : "movie-synopsis"}>
              {isFreePlan ? lockedSynopsis : selectedMovie.synopsis}
            </p>
            {isFreePlan && (
              <strong className="upgrade-note">
                (upgrade to Medium to unlock)
              </strong>
            )}

            <dl className="movie-detail-list">
              <DetailRow label="year" value={selectedMovie.year} />
              <DetailRow label="Genre" value={selectedMovie.genre} />
              <DetailRow label="Runtime" value={selectedMovie.runtime} />
              <DetailRow label="Director" value={selectedMovie.director} />
              <DetailRow
                label="Score"
                value={<span className="detail-score">★ {selectedMovie.score.toFixed(1)}</span>}
              />
              <DetailRow
                label="Image URL"
                value={isFreePlan ? "xxxxxxxxxxxxxxx" : selectedMovie.imageUrl}
                locked={isFreePlan}
              />
            </dl>
          </section>
        </div>
      )}

      {showLoginPrompt && (
        <div
          className="modal-backdrop"
          onClick={() => setShowLoginPrompt(false)}
          role="presentation"
        >
          <section
            className="login-required-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-required-title"
          >
            <h2 id="login-required-title">Login required</h2>
            <p>
              Please login to explore our full database and get your API key.
              Start for free - 5 requests per minute, no credit card needed.
            </p>
            <div className="login-actions">
              <Link to="/register">Sign up free -&gt;</Link>
              <button onClick={() => setShowLoginPrompt(false)}>Not now</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}