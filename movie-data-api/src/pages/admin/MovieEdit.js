import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./styles/MovieEdit.css";

export default function MovieEdit({ movies, onSave }) {
  const { id }   = useParams();
  const navigate = useNavigate();

  const found = movies?.find((m) => m.id === Number(id));
  console.log("found:", found);  // ← ถ้า undefined = หาไม่เจอ
  const [form, setForm] = useState(
    found
      ? {
          title:       found.title,
          genre:       found.genre.join(", "),
          year:        found.year,
          duration:    found.duration,
          language:    found.language,
          rating:      found.rating,
          image:       found.image || "",
          description: found.description || "",
        }
      : null
  );

  if (!form) {
    return (
      <div className="me-not-found">
        <p>Movie not found.</p>
        <button onClick={() => navigate("/admin/movie-management")}>
          ← Back
        </button>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave({
      ...found,
      title:       form.title,
      genre:       form.genre.split(",").map((g) => g.trim()),
      year:        Number(form.year),
      duration:    Number(form.duration),
      language:    form.language,
      rating:      parseFloat(form.rating),
      image:       form.image || null,
      description: form.description,
    });
    navigate("/admin/movie-management");
  };

  return (
    <div className="me-page">
      <h1 className="me-page-title">Movie Edit</h1>

      <div className="me-card">

        {/* Row 1 — Title / Genre */}
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

        {/* Row 2 — Year / Duration */}
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

        {/* Row 3 — Language / Rating */}
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

        {/* Row 4 — Image */}
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

        {/* Row 5 — Description */}
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

        {/* Buttons */}
        <div className="me-footer">
          <button
            className="me-cancel-btn"
            onClick={() => navigate("/admin/movie-management")}
          >
            Cancel
          </button>
          <button className="me-save-btn" onClick={handleSave}>
            Save
          </button>
        </div>

      </div>
    </div>
  );
}