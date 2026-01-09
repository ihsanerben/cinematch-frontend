import React, { useEffect, useState, useCallback } from "react";
import { FaStar, FaTimes, FaCalendarAlt, FaTrash } from "react-icons/fa";
import Navbar from "../Navbar/Navbar";
import api from "../../api/axios";
import "./Favourites.css";

const Favourites = () => {
  const [movieFavs, setMovieFavs] = useState([]);
  const [seriesFavs, setSeriesFavs] = useState([]);
  const [tab, setTab] = useState("movies");
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadFavs = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = tab === "movies" ? "/favorites/movie" : "/favorites/serie";
      const res = await api.get(endpoint);
      if (tab === "movies") setMovieFavs(res.data || []);
      else setSeriesFavs(res.data || []);
    } catch (e) {
      console.error("Fav load error:", e);
    } finally {
      setLoading(false);
    }
  }, [tab]);

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

  useEffect(() => {
    loadFavs();
  }, [loadFavs]);

  const removeFavorite = async (e, item) => {
    e.stopPropagation();
    try {
      const type = tab === "movies" ? "movie" : "serie";
      await api.delete(`/favorites/${type}/${item.contentId}`);
      
      if (tab === "movies") {
        setMovieFavs(prev => prev.filter(m => m.contentId !== item.contentId));
      } else {
        setSeriesFavs(prev => prev.filter(s => s.contentId !== item.contentId));
      }
    } catch (err) {
      console.error("Remove error:", err);
    }
  };

  const currentList = tab === "movies" ? movieFavs : seriesFavs;

  return (
    <div className="fav-page-wrapper">
      <Navbar />

      <div className="favorites-container">
        <header className="fav-header">
          <h1 className="favorites-title">My Collection</h1>
          <p className="fav-subtitle">Your personally curated movies and series</p>

          <div className="fav-tabs">
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
          <div className="loader">Updating collection...</div>
        ) : (
          <div className="movie-grid">
            {currentList.length === 0 ? (
              <div className="empty-state">
                <p>Your library is empty. Add some titles!</p>
              </div>
            ) : (
              currentList.map((item) => (
                <div
                  key={item.id}
                  className="movie-card"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="poster-container">
                    <img
                      src={item.posterUrl || "https://via.placeholder.com/300x450?text=No+Poster"}
                      alt={item.title || item.name}
                    />
                    <div
                      className="remove-badge"
                      onClick={(e) => removeFavorite(e, item)}
                      title="Remove from favorites"
                    >
                      <FaTrash />
                    </div>
                    <div className="card-overlay">
                      <span className="rating-tag"><FaStar /> {item.rating?.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="movie-info">
                    <h3>{item.title || item.name}</h3>
                    <p>{formatYear(item)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* MODERN MODAL */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedItem(null)}>
              <FaTimes />
            </button>
            
                <div className="modal-body">
                  <div className="modal-left">
                    <img src={selectedItem.posterUrl} alt={selectedItem.title} />
                  </div>
                  <div className="modal-right">
                    <div className="modal-badge">Favorite Saved</div>
                    <h2>{selectedItem.title || selectedItem.name}</h2>
                    <div className="modal-meta">
                      <span className="modal-rating"><FaStar color="#ffcc00" /> {selectedItem.rating}</span>
                      <span className="modal-year"><FaCalendarAlt /> {formatDate(selectedItem)}</span>
                    </div>
                    <div className="modal-divider"></div>
                    <h3>Overview</h3>
                    <p className="modal-description">
                      {selectedItem.overview || "No description available for this title."}
                    </p>
                    
                    <div className="modal-actions">
                       <button className="btn-secondary" onClick={(e) => {
                         removeFavorite(e, selectedItem);
                         setSelectedItem(null);
                       }}>
                         Remove from Favs
                       </button>
                    </div>
                  </div>
                </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Favourites;