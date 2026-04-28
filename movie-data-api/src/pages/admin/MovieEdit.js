import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import MovieForm from "./MovieForm";

export default function MovieEdit() {
  const { id } = useParams();
  const location = useLocation();
  const [movie, setMovie] = useState(location.state?.movie || null);
  const [loading, setLoading] = useState(!location.state?.movie);

  useEffect(() => {
    if (location.state?.movie) {
      return;
    }

    let isMounted = true;

    const fetchMovie = async () => {
      try {
        setLoading(true);

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

        const movieRes = await fetch(`/api/movies/${id}`, {
          headers: {
            "x-api-key": keyData.api_key,
          },
        });
        if (!movieRes.ok) {
          throw new Error("Movie not found");
        }

        const movieData = await movieRes.json();
        if (isMounted) {
          setMovie(movieData.data || null);
        }
      } catch (error) {
        if (isMounted) {
          setMovie(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMovie();

    return () => {
      isMounted = false;
    };
  }, [id, location.state]);

  return <MovieForm mode="edit" movie={movie} movieId={id} loading={loading} />;
}
