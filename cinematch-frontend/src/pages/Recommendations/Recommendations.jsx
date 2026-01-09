import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { FaThumbsUp } from "react-icons/fa";
import "./Recommendations.css";
import Navbar from "../Navbar/Navbar";

const Recommendations = () => {
  const [blocks, setBlocks] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const redirectTimeoutRef = useRef(null);

  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem("token");

  // FAVORİLERİ ÇEK
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isLoggedIn) return;
      try {
        const res = await api.get("/favorites/movie");
        const ids = (res.data || []).map((f) => f.contentId);
        setFavoriteIds(ids);
      } catch (err) {
        console.error("Favoriler alınamadı:", err);
      }
    };

    fetchFavorites();
  }, [isLoggedIn]);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  // FAVORİYİ AÇ – KAPAT
  const toggleFavorite = async (movieId, isFav) => {
    try {
      if (isFav) {
        await api.delete(`/favorites/movie/${movieId}`);
        setFavoriteIds((prev) => prev.filter((id) => id !== movieId));
      } else {
        await api.post(`/favorites/movie/${movieId}`);
        setFavoriteIds((prev) => [...prev, movieId]);
      }
    } catch (err) {
      console.error("Favori API hatası:", err);
    }
  };

  // BACKEND'DEN ÖNERİLERİ ÇEK
  const fetchRecommendations = async () => {
    if (favoriteIds.length === 0) {
      setNotice(
        "You haven't selected a series or movie yet. Please select one. You are being redirected to the movies/series page."
      );
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
      redirectTimeoutRef.current = setTimeout(() => {
        navigate("/movies");
      }, 4000);
      return;
    }

    try {
      setLoading(true);
      setNotice("");
      setBlocks([]);

      const res = await api.get("/recommendations/personal");
      setBlocks(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar/>
      <div className="rec-page">
        <h1 className="rec-title">🔮 Personalized Recommendations</h1>

        <button className="rec-btn" onClick={fetchRecommendations}>
          {loading ? "Loading..." : "Get Recommendations"}
        </button>

        {notice && <p className="rec-notice">{notice}</p>}

        {blocks.map((block, index) => (
          <div key={index} className="rec-group">
            <h2 className="rec-group-title">
              ⭐ Because you liked <span>{block.basedOn}</span>
            </h2>

            <div className="rec-grid">
              {block.recommendations.map((movie) => {
                const isFav = favoriteIds.includes(movie.id);

                return (
                  <div
                    key={movie.id}
                    className="rec-card"
                    onClick={() => setSelectedMovie(movie)}
                  >
                    {/* FAVORİ İKONU */}
                    <div
                      className="rec-fav"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(movie.id, isFav);
                      }}
                    >
                      <FaThumbsUp
                        className={`fav-icon ${isFav ? "active" : ""}`}
                      />
                    </div>

                    {/* POSTER */}
                    <img
                      src={
                        movie.posterUrl ||
                        "https://via.placeholder.com/230x300?text=No+Image"
                      }
                      alt={movie.title}
                      className="rec-poster"
                    />

                    <h3 className="rec-title-item">{movie.title}</h3>
                    <p className="rec-rating">⭐ {movie.rating?.toFixed(1)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* MODAL */}
        {selectedMovie && (
          <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <img
                src={
                  selectedMovie.posterUrl ||
                  "https://via.placeholder.com/400x600?text=No+Image"
                }
                alt={selectedMovie.title}
                className="modal-poster"
              />
              <div className="modal-details">
                <h2>{selectedMovie.title}</h2>
                <p className="rating">
                  ⭐ {selectedMovie.rating?.toFixed(1) || "N/A"}
                </p>
                <p>{selectedMovie.releaseDate}</p>
                <p className="modal-overview">{selectedMovie.overview}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Recommendations;
