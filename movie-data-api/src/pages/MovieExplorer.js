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
const RESET_AT_STORAGE_KEY = "movieExplorerResetAt";
const USED_QUOTA_STORAGE_KEY = "movieExplorerUsedQuota";

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
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object" && item.name)
          return String(item.name).trim();
        return "";
      })
      .filter(Boolean);
  }

  if (typeof genreValue === "string") {
    const trimmed = genreValue.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        return normalizeGenres(JSON.parse(trimmed));
      } catch {
        const nameMatches = [...trimmed.matchAll(/name:\s*([^,}\]]+)/g)];
        if (nameMatches.length > 0)
          return nameMatches.map((match) => match[1].trim());
      }
    }

    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const mapBackendMovie = (raw) => {
  const movie = raw?.data ?? raw?.movie ?? raw;
  const genres = normalizeGenres(movie.genre);

  return {
    id: movie.id,
    title: movie.title || "",
    genre: genres.join(", ") || "-",
    genres,
    year: movie.release_year ?? movie.year ?? "-",
    runtime:
      movie.runtime !== null && movie.runtime !== undefined
        ? `${movie.runtime} min`
        : "-",
    score:
      typeof movie.rating === "number"
        ? movie.rating
        : typeof movie.score === "number"
        ? movie.score
        : Number.parseFloat(movie.rating ?? movie.score ?? 0) || 0,
    imageUrl: movie.image_url ?? movie.imageUrl ?? "",
    synopsis: movie.description ?? movie.synopsis ?? "No synopsis available.",
  };
};

const DetailRow = ({ label, value, locked }) => (
  <div className="movie-detail-row">
    <dt>{label}</dt>
    <dd className={locked ? "is-locked-text" : ""}>{value}</dd>
  </div>
);

const getInitialResetAt = () => {
  const storedValue = Number(localStorage.getItem(RESET_AT_STORAGE_KEY));
  const now = Date.now();
  if (Number.isFinite(storedValue) && storedValue > now) return storedValue;
  return now + RESET_INTERVAL_MS;
};

const getInitialUsedQuota = (plan) => {
  if (plan === "guest") return 0;

  const now = Date.now();
  const storedResetAt = Number(localStorage.getItem(RESET_AT_STORAGE_KEY));

  if (!Number.isFinite(storedResetAt) || storedResetAt <= now) {
    localStorage.removeItem(USED_QUOTA_STORAGE_KEY);
    localStorage.removeItem(RESET_AT_STORAGE_KEY);
    return 0;
  }

  const storedQuota = Number(localStorage.getItem(USED_QUOTA_STORAGE_KEY));
  return Number.isFinite(storedQuota) && storedQuota >= 0 ? storedQuota : 0;
};

export default function MovieExplorer() {
  const token = localStorage.getItem("token");
  const storedPlan = localStorage.getItem("plan") || "free";
  const isLoggedIn = Boolean(token);

  const [plan] = useState(isLoggedIn ? storedPlan : "guest");
  const [apiKey, setApiKey] = useState("");
  const [apiKeyLoading, setApiKeyLoading] = useState(isLoggedIn);
  const [usedQuota, setUsedQuota] = useState(() =>
    getInitialUsedQuota(isLoggedIn ? storedPlan : "guest")
  );
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("all");
  const [sort, setSort] = useState("default");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieDetailLoading, setMovieDetailLoading] = useState(false);
  const [movieDetailError, setMovieDetailError] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(isLoggedIn);
  const [loadError, setLoadError] = useState("");
  const [isMoviesRateLimited, setIsMoviesRateLimited] = useState(false);
  const [resetAt, setResetAt] = useState(getInitialResetAt);
  const [timeLeftMs, setTimeLeftMs] = useState(() =>
    Math.max(0, getInitialResetAt() - Date.now())
  );
  // ✅ trigger ให้ fetchMovies ทำงานใหม่หลัง quota reset
  const [quotaResetTrigger, setQuotaResetTrigger] = useState(0);

  const quotaLimit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  const isRateLimited = usedQuota >= quotaLimit && plan !== "guest";
  const isFreePlan = plan === "free";
  const canUseFullDataset = plan !== "guest";
  const hasAdvancedTools = plan === "medium" || plan === "premium";
  const canFilterByGenre = hasAdvancedTools;
  const showRateLimitPanel = isRateLimited || isMoviesRateLimited;

  // ── helper: sync resetAt จาก 429 response body ───────────────────
  const syncResetAtFrom429 = (errJson) => {
    if (errJson.reset_at) {
      const backendResetAt = new Date(errJson.reset_at).getTime();
      if (Number.isFinite(backendResetAt) && backendResetAt > Date.now()) {
        setResetAt(backendResetAt);
        setTimeLeftMs(Math.max(0, backendResetAt - Date.now()));
        return;
      }
    }

    if (errJson.retry_after_seconds) {
      const newResetAt = Date.now() + errJson.retry_after_seconds * 1000;
      setResetAt(newResetAt);
      setTimeLeftMs(errJson.retry_after_seconds * 1000);
      return;
    }

    // fallback: Retry-After header
    const retryAfter = Number(errJson.retry_after ?? 60);
    const newResetAt = Date.now() + retryAfter * 1000;
    setResetAt(newResetAt);
    setTimeLeftMs(retryAfter * 1000);
  };

  // ── Step 1: ดึง API Key ก่อน ──────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setApiKeyLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchApiKey = async () => {
      try {
        const res = await fetch("/api/key/", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        setApiKey(data.api_key ?? "");
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("fetchApiKey error:", err);
        setLoadError("Unable to load API key. Please try again.");
      } finally {
        setApiKeyLoading(false);
      }
    };

    fetchApiKey();
    return () => controller.abort();
  }, [token]);

 // ── Step 2: ดึงหนังหลังจากได้ API Key แล้ว ────────────────────────
useEffect(() => {
  if (apiKeyLoading) return;
  if (!token || !apiKey) {
    setMovies([]);
    setLoading(false);
    return;
  }

  const controller = new AbortController();

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setLoadError("");
      setIsMoviesRateLimited(false);

      const res = await fetch("/api/movies/", {
        headers: { "x-api-key": apiKey },
        signal: controller.signal,
      });

      // ✅ 429 → แสดง error panel
      if (res.status === 429) {
        const errJson = await res.json().catch(() => ({}));
        setUsedQuota(quotaLimit);
        syncResetAtFrom429(errJson);
        setIsMoviesRateLimited(true);
        return;
      }else{
        setUsedQuota(usedQuota);
        setIsMoviesRateLimited(false);
      }




      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const json = await res.json();

      // ✅ 200 → sync quota จาก Backend ถ้ามี
      if (json.quota) {
        setUsedQuota(json.quota.used ?? 0);
        if (json.quota.reset_at) {
          const backendResetAt = new Date(json.quota.reset_at).getTime();
          if (Number.isFinite(backendResetAt) && backendResetAt > Date.now()) {
            setResetAt(backendResetAt);
            setTimeLeftMs(Math.max(0, backendResetAt - Date.now()));
          }
        }
      } else {
        // ✅ Backend ไม่ส่ง quota มา → นับเองฝั่ง Frontend +1
        setUsedQuota((prev) => Math.min(prev + 1, quotaLimit));
      }

      const list = Array.isArray(json)
        ? json
        : Array.isArray(json.data)
        ? json.data
        : [];

      setMovies(list.map(mapBackendMovie));
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("fetchMovies error:", err);
      setMovies([]);
      setLoadError("Unable to load movies from backend right now.");
    } finally {
      setLoading(false);
    }
  };

  fetchMovies();
  return () => controller.abort();
}, [token, apiKey, apiKeyLoading, quotaResetTrigger]);

  // ── Timer reset quota ─────────────────────────────────────────────
  useEffect(() => {
    if (plan === "guest") {
      setUsedQuota(0);
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const now = Date.now();
      if (now >= resetAt) {
        const nextResetAt = now + RESET_INTERVAL_MS;
        setUsedQuota(0);
        setIsMoviesRateLimited(false);
        setResetAt(nextResetAt);
        setTimeLeftMs(RESET_INTERVAL_MS);
        localStorage.setItem(RESET_AT_STORAGE_KEY, String(nextResetAt));
        localStorage.setItem(USED_QUOTA_STORAGE_KEY, "0");
        // ✅ trigger fetchMovies ใหม่เพื่อ sync จาก Backend
        setQuotaResetTrigger((n) => n + 1);
        return;
      }
      setTimeLeftMs(resetAt - now);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [plan, resetAt]);

  useEffect(() => {
    if (plan === "guest") {
      localStorage.removeItem(RESET_AT_STORAGE_KEY);
      localStorage.removeItem(USED_QUOTA_STORAGE_KEY);
      return;
    }
    localStorage.setItem(RESET_AT_STORAGE_KEY, String(resetAt));
  }, [plan, resetAt]);

  useEffect(() => {
    if (plan === "guest") return;
    localStorage.setItem(USED_QUOTA_STORAGE_KEY, String(usedQuota));
  }, [plan, usedQuota]);

  // ── Derived ───────────────────────────────────────────────────────
  const genres = useMemo(
    () => [
      "all",
      ...Array.from(new Set(movies.flatMap((movie) => movie.genres))),
    ],
    [movies]
  );

  const visibleMovies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const result = movies.filter((movie) => {
      const matchesQuery = !normalizedQuery
        ? true
        : plan === "premium"
        ? movie.title.toLowerCase().includes(normalizedQuery) ||
          movie.genre.toLowerCase().includes(normalizedQuery) ||
          String(movie.year).includes(normalizedQuery)
        : hasAdvancedTools
        ? movie.title.toLowerCase().includes(normalizedQuery) ||
          movie.genre.toLowerCase().includes(normalizedQuery)
        : movie.title.toLowerCase().includes(normalizedQuery);

      const matchesGenre =
        !canFilterByGenre || genre === "all" || movie.genres.includes(genre);

      return matchesQuery && matchesGenre;
    });

    if (sort === "score-desc") result.sort((a, b) => b.score - a.score);
    if (sort === "score-asc") result.sort((a, b) => a.score - b.score);

    return canUseFullDataset ? result : result.slice(0, 4);
  }, [
    canFilterByGenre,
    canUseFullDataset,
    genre,
    hasAdvancedTools,
    plan,
    movies,
    query,
    sort,
  ]);

  // ── Helpers ───────────────────────────────────────────────────────
  const requestDemo = (callback) => {
    if (plan === "guest") {
      setShowLoginPrompt(true);
      return;
    }
    if (usedQuota >= quotaLimit) return;
    setUsedQuota((current) => current + 1);
    callback();
  };

  // ── เปิดดูรายละเอียด → ยิง /api/movies/:id ────────────────────────
  const openMovie = (movie) => {
    requestDemo(async () => {
      setMovieDetailError("");
      setMovieDetailLoading(true);
      setSelectedMovie({ id: movie.id, title: movie.title });

      const controller = new AbortController();

      try {
        const res = await fetch(`/api/movies/${movie.id}`, {
          headers: { "x-api-key": apiKey },
          signal: controller.signal,
        });

        if (res.status === 429) {
          const errJson = await res.json().catch(() => ({}));
          setUsedQuota(quotaLimit);
          syncResetAtFrom429(errJson);
          throw new Error(errJson.message || "Rate limit exceeded");
        }

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(
            errJson.message || errJson.error || `HTTP ${res.status}`
          );
        }

        const json = await res.json();
        setSelectedMovie(mapBackendMovie(json));
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("openMovie error:", err);
        setMovieDetailError(err.message || "Unable to load movie details.");
      } finally {
        setMovieDetailLoading(false);
      }
    });
  };

  const handleSearchChange = (event) => setQuery(event.target.value);

  const secondsUntilReset = Math.max(0, Math.ceil(timeLeftMs / 1000));
  const resetTimeLabel = formatResetTime(resetAt);
  const lockedSynopsis =
    "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx xxxxxxxxxxxxxxxx";

  // ── Loading API Key ────────────────────────────────────────────────
  if (apiKeyLoading) {
    return (
      <main className="movie-explorer">
        <section className="guest-unlock">
          <p>Loading...</p>
        </section>
      </main>
    );
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <main className="movie-explorer">
      {!isLoggedIn && (
        <div className="explorer-signup-banner">
          Want to build your own movie app? Sign up now to get your free API
          key and start making 10 requests per minute!
        </div>
      )}

      {/* Toolbar */}
      <section
        className={`explorer-toolbar ${
          canFilterByGenre ? "" : "explorer-toolbar-simple"
        }`.trim()}
        aria-label="Movie filters"
      >
        <input
          className="explorer-search"
          value={query}
          onChange={handleSearchChange}
          placeholder={
            plan === "premium"
              ? "Search by title, genre, year..."
              : hasAdvancedTools
              ? "Search by title, genre..."
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
            <span className="quota-reset-time">
              Reset in {secondsUntilReset}s
            </span>
          )}
        </div>
      </section>

      {/* Movie list */}
      {loading ? (
        <section className="guest-unlock">
          <p>Loading movies...</p>
        </section>
      ) : loadError ? (
        <section className="guest-unlock">
          <p>{loadError}</p>
        </section>
      ) : showRateLimitPanel ? (
        <section className="rate-limit-panel" role="alert">
          <h1>429</h1>
          <strong>Rate limit exceeded</strong>
          <p>
            You have used all {quotaLimit} requests for this minute. Upgrade
            for a higher rate limit.
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
                <span>
                  {!isLoggedIn && index === 3 ? "xxxxx" : movie.title}
                </span>
                <small>
                  {!isLoggedIn && index === 3 ? "xxxxx" : movie.genre}
                </small>
                <small className="movie-score">
                  {!isLoggedIn && index === 3
                    ? "x.x"
                    : movie.score.toFixed(1)}
                </small>
              </button>
            ))}
          </section>

          {!isLoggedIn && (
            <section className="guest-unlock">
              <p>
                Showing {visibleMovies.length} of {movies.length} films. Login
                to access the full database.
              </p>
              <Link to="/register">Sign up free to unlock all -&gt;</Link>
            </section>
          )}

          {visibleMovies.length === 0 && !loading && (
            <section className="guest-unlock">
              <p>No movies found.</p>
            </section>
          )}
        </>
      )}

      {/* Modal รายละเอียดหนัง */}
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

            {movieDetailLoading ? (
              <p>Loading movie details...</p>
            ) : movieDetailError ? (
              <>
                <h2 id="movie-detail-title">{selectedMovie.title}</h2>
                <p className="detail-error">{movieDetailError}</p>
              </>
            ) : (
              <>
                <h2 id="movie-detail-title">{selectedMovie.title}</h2>
                <p className="movie-id">ID : {selectedMovie.id}</p>

                <p
                  className={
                    isFreePlan ? "synopsis-locked" : "movie-synopsis"
                  }
                >
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
                    value={
                      <span className="detail-score">
                        ★ {selectedMovie.score?.toFixed(1)}
                      </span>
                    }
                  />
                  <DetailRow
                    label="Image URL"
                    value={
                      isFreePlan
                        ? "xxxxxxxxxxxxxxx"
                        : selectedMovie.imageUrl || "-"
                    }
                    locked={isFreePlan}
                  />
                </dl>
              </>
            )}
          </section>
        </div>
      )}

      {/* Modal Login Prompt */}
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
              <button onClick={() => setShowLoginPrompt(false)}>
                Not now
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}