import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/MovieManagement.css";

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
        const parsed = JSON.parse(trimmed);
        return normalizeGenres(parsed);
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

const mapBackendMovie = (movie) => ({
  id: movie.id,
  title: movie.title || "",
  genre: normalizeGenres(movie.genre),
  duration: movie.runtime ?? "-",
  year: movie.release_year ?? "-",
  language: movie.language || "-",
  rating: movie.rating ?? "-",
  image: movie.image_url || null,
  description: movie.description || "",
});

// ===== Delete Confirm Modal =====
const DeleteModal = ({ movie, onConfirm, onClose }) => (
  <>
    <div className="modal-backdrop" onClick={onClose} />
    <div className="modal-box modal-box-sm">
      <h2 className="modal-title">Delete Movie</h2>
      <p className="modal-desc">
        Are you sure you want to delete <strong>"{movie.title}"</strong>?
        This action cannot be undone.
      </p>
      <div className="modal-actions">
        <button className="modal-btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button
          className="modal-btn-danger"
          onClick={() => {
            onConfirm(movie.id);
            onClose();
          }}
        >
          Delete
        </button>
      </div>
    </div>
  </>
);

// ===== Main =====
export default function MoviesAdmin({ movies = [], onDelete }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [movieList, setMovieList] = useState(movies);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchMovies = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Missing token");
        }

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

        const movieRes = await fetch("/api/movies/", {
          headers: {
            "x-api-key": keyData.api_key,
          },
        });
        if (!movieRes.ok) {
          throw new Error("Failed to load movies");
        }

        const movieData = await movieRes.json();
        const mappedMovies = (movieData.data || []).map(mapBackendMovie);

        if (isMounted) {
          setMovieList(mappedMovies);
        }
      } catch (error) {
        if (isMounted) {
          setMovieList(movies);
          setLoadError(
            "Unable to load movies from backend. Showing local data instead."
          );
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
  }, [movies]);

  const filtered = movieList.filter((movie) => {
    const keyword = search.toLowerCase();
    return (
      movie.title.toLowerCase().includes(keyword) ||
      movie.genre.join(" ").toLowerCase().includes(keyword) ||
      movie.language.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="ma-wrapper">
      {deleteTarget && (
        <DeleteModal
          movie={deleteTarget}
          onConfirm={onDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      <div className="ma-header">
        <h1 className="ma-title">Movies</h1>
        <div className="ma-search-box">
          <span className="ma-search-left">Search</span>
          <input
            className="ma-search-input"
            type="text"
            placeholder="Search title, genre, language"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="ma-search-right">Find</span>
        </div>
      </div>

      {loading && <div className="ma-empty">Loading movies...</div>}
      {!loading && loadError && <div className="ma-empty">{loadError}</div>}

      <div className="ma-table-wrapper">
        <table className="ma-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Genre</th>
              <th>Duration</th>
              <th>Year</th>
              <th>Language</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filtered.length > 0 ? (
              filtered.map((movie) => (
                <tr key={movie.id}>
                  <td className="ma-id">{movie.id}</td>
                  <td className="ma-movie-title">{movie.title}</td>
                  <td className="ma-genre">{movie.genre.join(", ")}</td>
                  <td>{movie.duration}</td>
                  <td>{movie.year}</td>
                  <td>{movie.language}</td>
                  <td>{movie.rating}</td>
                  <td>
                    <div className="ma-actions">
                      <button
                        className="ma-edit-btn"
                        onClick={() => navigate(`/admin/movie-edit/${movie.id}`)}
                      >
                        Edit
                      </button>
                      <span className="ma-divider">/</span>
                      <button
                        className="ma-delete-btn"
                        onClick={() => setDeleteTarget(movie)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              !loading && (
                <tr>
                  <td colSpan={8} className="ma-empty">
                    No movies found
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}