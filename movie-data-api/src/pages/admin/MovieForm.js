import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/MovieEdit.css";

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
    return genreValue
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const createEmptyForm = () => ({
  title: "",
  genre: "",
  year: "",
  duration: "",
  language: "",
  rating: "",
  image: "",
  description: "",
});

const mapMovieToForm = (movie) => ({
  title: movie.title || "",
  genre: normalizeGenres(movie.genre).join(", "),
  year: movie.release_year ?? movie.year ?? "",
  duration: movie.runtime ?? movie.duration ?? "",
  language: movie.language || "",
  rating: movie.rating ?? "",
  image: movie.image_url ?? movie.image ?? "",
  description: movie.description || "",
});

export default function MovieForm({
  mode,
  movie,
  movieId,
  loading = false,
}) {
  const navigate = useNavigate();
  const [form, setForm] = useState(() =>
    movie ? mapMovieToForm(movie) : createEmptyForm()
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isCreateMode = mode === "create";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Missing token");
      }

      const payload = {
        title: form.title.trim(),
        genre: normalizeGenres(form.genre).join(", "),
        release_year: form.year ? Number(form.year) : 0,
        runtime: form.duration ? Number(form.duration) : 0,
        language: form.language.trim(),
        rating: form.rating ? Number(form.rating) : 0,
        description: form.description.trim(),
        image_url: form.image.trim(),
      };

      if (!payload.title) {
        throw new Error("Title is required");
      }

      const response = await fetch(
        isCreateMode ? "/api/admin/movies" : `/api/admin/movies/${movieId}`,
        {
          method: isCreateMode ? "POST" : "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Unable to save movie");
      }

      navigate("/admin/movie-management");
    } catch (saveError) {
      setError(saveError.message || "Unable to save movie.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="me-not-found">
        <p>Loading movie...</p>
      </div>
    );
  }

  if (!isCreateMode && !movie) {
    return (
      <div className="me-not-found">
        <p>{error || "Movie not found"}</p>
        <button onClick={() => navigate("/admin/movie-management")}>Back</button>
      </div>
    );
  }

  return (
    <div className="me-page">
      <h1 className="me-page-title">{isCreateMode ? "Add Movie" : "Movie Edit"}</h1>

      <div className="me-card">
        {error && <div className="me-error">{error}</div>}

        <div className="me-row">
          <div className="me-field">
            <label className="me-label">Title</label>
            <input
              className="me-input"
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
            />
          </div>
          <div className="me-field">
            <label className="me-label">Genre</label>
            <input
              className="me-input"
              type="text"
              name="genre"
              value={form.genre}
              onChange={handleChange}
              placeholder="e.g. Drama, Crime"
            />
          </div>
        </div>

        <div className="me-row">
          <div className="me-field">
            <label className="me-label">Year</label>
            <input
              className="me-input"
              type="number"
              name="year"
              value={form.year}
              onChange={handleChange}
            />
          </div>
          <div className="me-field">
            <label className="me-label">Duration</label>
            <input
              className="me-input"
              type="number"
              name="duration"
              value={form.duration}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="me-row">
          <div className="me-field">
            <label className="me-label">Language</label>
            <input
              className="me-input"
              type="text"
              name="language"
              value={form.language}
              onChange={handleChange}
            />
          </div>
          <div className="me-field">
            <label className="me-label">Rating</label>
            <input
              className="me-input"
              type="number"
              name="rating"
              value={form.rating}
              onChange={handleChange}
              step="0.1"
              min="0"
              max="10"
            />
          </div>
        </div>

        <div className="me-row">
          <div className="me-field me-field-full">
            <label className="me-label">Image</label>
            <input
              className="me-input"
              type="text"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="None"
            />
          </div>
        </div>

        <div className="me-row">
          <div className="me-field me-field-full">
            <label className="me-label">Description</label>
            <textarea
              className="me-textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={7}
            />
          </div>
        </div>

        <div className="me-footer">
          <button
            className="me-cancel-btn"
            onClick={() => navigate("/admin/movie-management")}
            disabled={saving}
          >
            Cancel
          </button>
          <button className="me-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : isCreateMode ? "Create Movie" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
