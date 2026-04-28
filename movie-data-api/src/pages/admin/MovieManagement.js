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

const DeleteModal = ({ movie, onConfirm, onClose, deleting }) => (
  <>
    <div className="modal-backdrop" onClick={onClose} />
    <div className="modal-box modal-box-sm">
      <h2 className="modal-title">Delete Movie</h2>
      <p className="modal-desc">
        Are you sure you want to delete <strong>"{movie.title}"</strong>?
        This action cannot be undone.
      </p>
      <div className="modal-actions">
        <button className="modal-btn-secondary" onClick={onClose} disabled={deleting}>
          Cancel
        </button>
        <button
          className="modal-btn-danger"
          onClick={async () => {
            const success = await onConfirm(movie.id);
            if (success) {
              onClose();
            }
          }}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  </>
);

export default function MoviesAdmin() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [movieList, setMovieList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchMovies = async () => {
    setLoading(true);
    setLoadError("");

    try {
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
      setMovieList((movieData.data || []).map(mapBackendMovie));
    } catch (error) {
      setMovieList([]);
      setLoadError(error.message || "Unable to load movies from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleDeleteMovie = async (id) => {
    try {
      setDeletingId(id);
      setActionError("");

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Missing token");
      }

      const response = await fetch(`/api/admin/movies/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete movie");
      }

      setMovieList((prev) => prev.filter((movie) => movie.id !== id));
      return true;
    } catch (error) {
      setActionError(error.message || "Unable to delete movie.");
      return false;
    } finally {
      setDeletingId(null);
    }
  };

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
          onConfirm={handleDeleteMovie}
          onClose={() => setDeleteTarget(null)}
          deleting={deletingId === deleteTarget.id}
        />
      )}

      <div className="ma-header">
        <h1 className="ma-title">Movies</h1>
        <div className="ma-toolbar">
          <div className="ma-search-box">
            <input
              className="ma-search-input"
              type="text"
              placeholder="Search title, genre, language"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className="ma-add-btn"
            onClick={() => navigate("/admin/movie-create")}
          >
            Add Movie
          </button>
        </div>
      </div>

      {loading && <div className="ma-empty">Loading movies...</div>}
      {!loading && loadError && <div className="ma-empty">{loadError}</div>}
      {!loading && actionError && <div className="ma-empty">{actionError}</div>}

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
                        onClick={() =>
                          navigate(`/admin/movie-edit/${movie.id}`, {
                            state: { movie },
                          })
                        }
                      >
                        Edit
                      </button>
                      <span className="ma-divider">/</span>
                      <button
                        className="ma-delete-btn"
                        disabled={deletingId === movie.id}
                        onClick={() => setDeleteTarget(movie)}
                      >
                        {deletingId === movie.id ? "Deleting..." : "Delete"}
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
