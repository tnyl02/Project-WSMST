import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/MovieExplorer.css";

const PLAN_LIMITS = {
  guest: 0,
  free: 10,
  medium: 50,
  premium: 100,
};

const RESET_INTERVAL_MS = 60 * 1000;

const formatResetTime = (timestamp) =>
  new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const normalizeGenres = (genreValue) => {
  if (Array.isArray(genreValue)) {
    return genreValue
      .map((item) => {
        if (typeof item === "string") {
          return item.trim();
        }
        if (item && typeof item === "object" && item.name) {
          return String(item.name).trim();
        }
        return "";
      })
      .filter(Boolean);
  }

  if (typeof genreValue === "string") {
    const trimmed = genreValue.trim();
    if (!trimmed) {
      return [];
    }

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        return normalizeGenres(JSON.parse(trimmed));
      } catch (error) {
        const nameMatches = [...trimmed.matchAll(/name:\s*([^,}\]]+)/g)];
        if (nameMatches.length > 0) {
          return nameMatches.map((match) => match[1].trim());
        }
      }
    }

    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const mapBackendMovie = (movie) => {
  const genres = normalizeGenres(movie.genre);

  return {
    id: movie.id,
    title: movie.title || "",
    genre: genres.join(", ") || "-",
    genres,
    year: movie.release_year ?? "-",
    runtime:
      movie.runtime !== null && movie.runtime !== undefined
        ? `${movie.runtime} min`
        : "-",
    score:
      typeof movie.rating === "number"
        ? movie.rating
        : Number.parseFloat(movie.rating || 0) || 0,
    imageUrl: movie.image_url || "",
    synopsis: movie.description || "No synopsis available.",
  };
};

const DetailRow = ({ label, value, locked }) => (
  <div className="movie-detail-row">
    <dt>{label}</dt>
    <dd className={locked ? "is-locked-text" : ""}>{value}</dd>
  </div>
);

export default function MovieExplorer() {
  const token = localStorage.getItem("token");
  const storedPlan = localStorage.getItem("plan") || "free";
  const isLoggedIn = Boolean(token);

  const [plan] = useState(isLoggedIn ? storedPlan : "guest");
  const [usedQuota, setUsedQuota] = useState(0);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("all");
  const [sort, setSort] = useState("default");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(isLoggedIn);
  const [loadError, setLoadError] = useState("");
  const [resetAt, setResetAt] = useState(() => Date.now() + RESET_INTERVAL_MS);
  const [timeLeftMs, setTimeLeftMs] = useState(RESET_INTERVAL_MS);

  const quotaLimit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  const isRateLimited = usedQuota >= quotaLimit && plan !== "guest";
  const isFreePlan = plan === "free";
  const canUseFullDataset = plan !== "guest";
  const hasAdvancedTools = plan === "medium" || plan === "premium";
  const canFilterByGenre = hasAdvancedTools;

  useEffect(() => {
    let isMounted = true;

    const fetchMovies = async () => {
      if (!token) {
        setMovies([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setLoadError("");

        const keyRes = await fetch("/api/key/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!keyRes.ok) {
          throw new Error("Failed to load API key");
        }

        const keyData = await keyRes.json();
        if (!keyData.api_key || keyData.api_key === "REVOKED") {
          throw new Error("API key is unavailable");
        }

        const moviesRes = await fetch("/api/movies/", {
          headers: {
            "x-api-key": keyData.api_key,
          },
        });

        if (!moviesRes.ok) {
          throw new Error("Failed to load movies");
        }

        const movieData = await moviesRes.json();
        const mappedMovies = (movieData.data || []).map(mapBackendMovie);

        if (isMounted) {
          setMovies(mappedMovies);
        }
      } catch (error) {
        if (isMounted) {
          setMovies([]);
          setLoadError("Unable to load movies from backend right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMovies();

    return () => {
      isMounted = false;
    };
  }, [token]);

  useEffect(() => {
    if (plan === "guest") {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const now = Date.now();

      if (now >= resetAt) {
        setUsedQuota(0);
        setResetAt(now + RESET_INTERVAL_MS);
        setTimeLeftMs(RESET_INTERVAL_MS);
        return;
      }

      setTimeLeftMs(resetAt - now);
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [plan, resetAt]);

  const genres = useMemo(
    () => ["all", ...Array.from(new Set(movies.flatMap((movie) => movie.genres)))],
    [movies]
  );

  const visibleMovies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = movies.filter((movie) => {
      const matchesQuery = !normalizedQuery
        ? true
        : hasAdvancedTools
        ? movie.title.toLowerCase().includes(normalizedQuery) ||
          movie.genre.toLowerCase().includes(normalizedQuery) ||
          String(movie.year).includes(normalizedQuery)
        : movie.title.toLowerCase().includes(normalizedQuery);

      const matchesGenre =
        !canFilterByGenre || genre === "all" || movie.genres.includes(genre);

      return matchesQuery && matchesGenre;
    });

    if (sort === "score-desc") {
      result.sort((a, b) => b.score - a.score);
    }

    if (sort === "score-asc") {
      result.sort((a, b) => a.score - b.score);
    }

    return canUseFullDataset ? result : result.slice(0, 4);
  }, [canFilterByGenre, canUseFullDataset, genre, hasAdvancedTools, movies, query, sort]);

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
  };

  const handleReset = () => {
    setUsedQuota(0);
    setResetAt(Date.now() + RESET_INTERVAL_MS);
    setTimeLeftMs(RESET_INTERVAL_MS);
  };

  const secondsUntilReset = Math.max(0, Math.ceil(timeLeftMs / 1000));
  const resetTimeLabel = formatResetTime(resetAt);

  const lockedSynopsis =
    "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx xxxxxxxxxxxxxxxx";

  return (
    <main className="movie-explorer">
      {!isLoggedIn && (
        <div className="explorer-signup-banner">
          Want to build your own movie app? Sign up now to get your free API key
          and start making 10 requests per minute!
        </div>
      )}

      <section
        className={`explorer-toolbar ${canFilterByGenre ? "" : "explorer-toolbar-simple"}`.trim()}
        aria-label="Movie filters"
      >
        <input
          className="explorer-search"
          value={query}
          onChange={handleSearchChange}
          placeholder={
            hasAdvancedTools
              ? "Search by title, genre, year..."
              : "Search by title..."
          }
        />

        {canFilterByGenre && (
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
        )}

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

        <div className="quota-counter">
          Quota: {plan === "guest" ? 0 : usedQuota}/{quotaLimit}
          {plan !== "guest" && (
            <span className="quota-reset-time">Reset in {secondsUntilReset}s</span>
          )}
        </div>

        <button className="toolbar-reset" onClick={handleReset}>
          Reset
        </button>
      </section>

      {loading ? (
        <section className="guest-unlock">
          <p>Loading movies...</p>
        </section>
      ) : loadError ? (
        <section className="guest-unlock">
          <p>{loadError}</p>
        </section>
      ) : isRateLimited ? (
        <section className="rate-limit-panel" role="alert">
          <h1>429</h1>
          <strong>Rate limit exceeded</strong>
          <p>
            You have used all {quotaLimit} requests for this minute. Upgrade for
            a higher rate limit.
          </p>
          <p className="rate-limit-reset-text">
            Quota resets at {resetTimeLabel} ({secondsUntilReset}s remaining)
          </p>
          <div className="rate-limit-actions">
            <Link to="/subscription">View plans</Link>
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
                    !isLoggedIn && index === 3 ? "poster-locked" : ""
                  }`}
                  style={
                    movie.imageUrl
                      ? {
                          backgroundImage: `url(${movie.imageUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : undefined
                  }
                />
                <span>{!isLoggedIn && index === 3 ? "xxxxx" : movie.title}</span>
                <small>{!isLoggedIn && index === 3 ? "xxxxx" : movie.genre}</small>
                <small className="movie-score">
                  {!isLoggedIn && index === 3 ? "x.x" : movie.score.toFixed(1)}
                </small>
              </button>
            ))}
          </section>

          {!isLoggedIn && (
            <section className="guest-unlock">
              <p>
                Showing {visibleMovies.length} of {movies.length} films. Login to
                access the full database.
              </p>
              <Link to="/register">Sign up free to unlock all -&gt;</Link>
            </section>
          )}

          {!visibleMovies.length && (
            <section className="guest-unlock">
              <p>No movies found.</p>
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
              <DetailRow label="Year" value={selectedMovie.year} />
              <DetailRow label="Genre" value={selectedMovie.genre} />
              <DetailRow label="Runtime" value={selectedMovie.runtime} />
              <DetailRow
                label="Score"
                value={<span className="detail-score">★ {selectedMovie.score.toFixed(1)}</span>}
              />
              <DetailRow
                label="Image URL"
                value={isFreePlan ? "xxxxxxxxxxxxxxx" : selectedMovie.imageUrl || "-"}
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
              Start for free - 10 requests per minute, no credit card needed.
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