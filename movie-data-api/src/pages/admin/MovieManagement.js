import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/MovieManagement.css";

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
        <button className="modal-btn-secondary" onClick={onClose}>Cancel</button>
        <button
          className="modal-btn-danger"
          onClick={() => { onConfirm(movie.id); onClose(); }}
        >
          Delete
        </button>
      </div>
    </div>
  </>
);

// ===== Main =====
export default function MoviesAdmin({ movies, onDelete }) {
  const navigate = useNavigate();
  const [search, setSearch]             = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = movies.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.genre.join(" ").toLowerCase().includes(search.toLowerCase()) ||
    m.language.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="ma-wrapper">

      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteModal
          movie={deleteTarget}
          onConfirm={onDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {/* Header */}
      <div className="ma-header">
        <h1 className="ma-title">Movies</h1>
        <div className="ma-search-box">
          <span className="ma-search-left">☰</span>
          <input
            className="ma-search-input"
            type="text"
            placeholder="Hinted search text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="ma-search-right">🔍</span>
        </div>
      </div>

      {/* Table */}
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
            {filtered.length > 0 ? (
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
                        แก้ไข
                      </button>
                      <span className="ma-divider">/</span>
                      <button
                        className="ma-delete-btn"
                        onClick={() => setDeleteTarget(movie)}
                      >
                        ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="ma-empty">No movies found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}