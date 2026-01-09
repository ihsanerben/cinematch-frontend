import React, { useEffect, useState, useCallback } from "react";
import { FaThumbsUp, FaStar, FaTimes, FaCalendarAlt } from "react-icons/fa";
import Navbar from "../Navbar/Navbar";
import api from "../../api/axios";
import "./OldRecommendations.css";

const OldRecommendations = () => {
  const [tab, setTab] = useState("movies");
  const [movieRecs, setMovieRecs] = useState([]);
  const [serieRecs, setSerieRecs] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = !!localStorage.getItem("token");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint =
        tab === "movies"
          ? "/movies/recommendations/history/movie"
          : "/series/recommendations/history/serie";
      const res = await api.get(endpoint);

      if (tab === "movies") setMovieRecs(res.data || []);
      else setSerieRecs(res.data || []);

      if (isLoggedIn) {
        const favEndpoint =
          tab === "movies" ? "/favorites/movie" : "/favorites/serie";
        const favRes = await api.get(favEndpoint);
        setFavoriteIds((favRes.data || []).map((f) => f.contentId));
      }
    } catch (e) {
      console.error("Data loading error:", e);
    } finally {
      setLoading(false);
    }
  }, [tab, isLoggedIn]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleFavorite = async (itemId, isFav) => {
    try {
      const base = tab === "movies" ? "movie" : "serie";
      if (isFav) {
        await api.delete(`/favorites/${base}/${itemId}`);
        setFavoriteIds((prev) => prev.filter((id) => id !== itemId));
      } else {
        await api.post(`/favorites/${base}/${itemId}`);
        setFavoriteIds((prev) => [...prev, itemId]);
      }
    } catch (e) {
      console.error("Favorite toggle error:", e);
    }
  };

  const formatDate = (item) => {
    const dateValue =
      item.releaseDate ||
      item.firstAirDate ||
      item.date ||
      item.year ||
      item.release_year;

    if (!dateValue) return "N/A";

    // If only year provided, fall back to Jan 1 of that year
    if (typeof dateValue === "number" || /^\d{4}$/.test(String(dateValue))) {
      const date = new Date(`${dateValue}-01-01`);
      return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
    }

    const parsed = new Date(dateValue);
    if (isNaN(parsed.getTime())) return "N/A";

    return parsed.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatYear = (item) => {
    const dateValue =
      item.releaseDate ||
      item.firstAirDate ||
      item.date ||
      item.year ||
      item.release_year;

    if (!dateValue) return "N/A";
    if (typeof dateValue === "number" || /^\d{4}$/.test(String(dateValue))) {
      return String(dateValue);
    }

    const parsed = new Date(dateValue);
    if (isNaN(parsed.getTime())) return "N/A";
    return String(parsed.getFullYear());
  };

  const currentList = tab === "movies" ? movieRecs : serieRecs;

  return (
    <div className="oldrec-page">
      <Navbar />

      <div className="oldrec-container">
        <header className="oldrec-header">
          <h1 className="oldrec-title">Discovery History</h1>
          <p className="oldrec-subtitle">
            Your personalized journey through cinema
          </p>

          <div className="oldrec-tabs">
            {["movies", "series"].map((t) => (
              <button
                key={t}
                className={tab === t ? "active" : ""}
                onClick={() => setTab(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="loader">Loading your history...</div>
        ) : currentList.length === 0 ? (
          <div className="no-data-card">
            <p>No recommendations found yet. Start exploring!</p>
          </div>
        ) : (
          currentList.map((group, index) => (
            <section key={index} className="history-group">
              <h2 className="history-section-title">
                {tab === "movies" ? "🎬" : "📺"} Because you liked{" "}
                <span>{group.basedOnTitle}</span>
              </h2>

              <div className="movie-grid">
                {(group.recommendedMovies || group.recommendedSeries || []).map(
                  (item) => {
                    const isFav = favoriteIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className="movie-card"
                        onClick={() => setSelectedItem(item)}
                      >
                        <div className="poster-container">
                          <img
                            src={
                              item.posterUrl ||
                              "https://via.placeholder.com/300x450?text=No+Poster"
                            }
                            alt={item.title || item.name}
                          />
                          <div
                            className={`favorite-badge ${
                              isFav ? "active" : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(item.id, isFav);
                            }}
                          >
                            <FaThumbsUp />
                          </div>
                          <div className="card-overlay">
                            <span className="rating-tag">
                              <FaStar /> {item.rating?.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <div className="movie-info">
                          <h3>{item.title || item.name}</h3>
                          <p>{formatYear(item)}</p>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </section>
          ))
        )}
      </div>

      {/* MODAL - Güncellenmiş Modern Tasarım */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Kapatma Butonu */}
            <button
              className="close-btn"
              onClick={() => setSelectedItem(null)}
              aria-label="Close"
            >
              <FaTimes />
            </button>

            <div className="modal-body">
              <div className="modal-left">
                <img
                  src={
                    selectedItem.posterUrl ||
                    "https://via.placeholder.com/300x450?text=No+Poster"
                  }
                  alt={selectedItem.title || selectedItem.name}
                />
              </div>
              <div className="modal-right">
                <h2>{selectedItem.title || selectedItem.name}</h2>
                <div className="modal-meta">
                  <span className="modal-rating">
                    <FaStar color="#ffcc00" /> {selectedItem.rating?.toFixed(1)}
                  </span>
                  <span className="modal-year">
                    <FaCalendarAlt /> {formatDate(selectedItem)}
                  </span>
                </div>
                <div className="modal-divider"></div>
                <h3>Overview</h3>
                <p className="modal-description">
                  {selectedItem.overview ||
                    selectedItem.description ||
                    "No description available for this title."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OldRecommendations;
