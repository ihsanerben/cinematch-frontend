import React, { useEffect, useState } from "react";
import { FaThumbsUp, FaBars } from "react-icons/fa";
import "../Movie/MovieSeries.css";
import Navbar from "../Navbar/Navbar.jsx";
import api from "../../api/axios";

const Series = () => {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [selectedSerie, setSelectedSerie] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("highestRated");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const isLoggedIn = !!localStorage.getItem("token");

  const formatDate = (item) => {
    const dateValue =
      item.releaseDate ||
      item.firstAirDate ||
      item.date ||
      item.year ||
      item.release_year;

    if (!dateValue) return "N/A";

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

  // 📌 Dizileri ve Favorileri Yükle
  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const res = await api.get("/series");
        setSeries(res.data || []);
      } catch (err) {
        console.error("Dizi verisi alınamadı:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchFavorites = async () => {
      if (!isLoggedIn) return;
      try {
        const res = await api.get("/favorites/serie");
        const ids = (res.data || []).map((f) => f.contentId); // backend: contentId = serie.id
        setFavoriteIds(ids);
      } catch (err) {
        console.error("Favori diziler alınamadı:", err);
      }
    };

    fetchSeries();
    fetchFavorites();
  }, [isLoggedIn]);

  // 👍 Favori ekle/çıkar
  const toggleFavorite = async (serieId, currentlyFav) => {
    if (!isLoggedIn) {
      alert("Please log in to add favorites.");
      return;
    }

    try {
      if (currentlyFav) {
        await api.delete(`/favorites/serie/${serieId}`);
        setFavoriteIds((prev) => prev.filter((id) => id !== serieId));
      } else {
        await api.post(`/favorites/serie/${serieId}`);
        setFavoriteIds((prev) => [...prev, serieId]);
      }
    } catch (err) {
      console.error("Favori dizi API hatası:", err);
    }
  };

  // 🔍 Filtre + Sıralama
  const filteredSeries = series
    .filter(
      (s) =>
        s &&
        s.name &&
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === "highestRated") return (b.rating || 0) - (a.rating || 0);
      if (sortOption === "newest")
        return new Date(b.firstAirDate || 0) - new Date(a.firstAirDate || 0);
      if (sortOption === "oldest")
        return new Date(a.firstAirDate || 0) - new Date(b.firstAirDate || 0);
      return 0;
    });

  const totalPages = Math.ceil(filteredSeries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleSeries = filteredSeries.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <>
      <Navbar />

      <div className="home-container">
        <div className="home-header">
          <h1 className="home-slogan">
            Discover the best series for your next watch 🎥
          </h1>
        </div>

        {/* 🔎 Search + Filter */}
        <div className="filter-bar">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search series..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="search-input"
            />

            <div className="filter-wrapper">
              <FaBars className="filter-icon" />
              <select
                className="filter-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="highestRated">⭐ Highest Rated</option>
                <option value="newest">🕓 Newest Releases</option>
                <option value="oldest">📽️ Oldest Releases</option>
              </select>
            </div>
          </div>
        </div>

        {/* 🎞️ Dizi listesi */}
        {loading ? (
          <p className="loading">Loading series...</p>
        ) : (
          <div className="movie-grid">
            {visibleSeries.map((serie) => {
              const isFav = favoriteIds.includes(serie.id);

              return (
                <div
                  key={serie.id}
                  className="movie-card"
                  onClick={() => setSelectedSerie(serie)}
                >
                  <div
                    className="thumb-wrapper"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(serie.id, isFav);
                    }}
                  >
                    <FaThumbsUp
                      className={`thumb-icon ${isFav ? "active" : ""}`}
                    />
                  </div>

                  <img
                    src={
                      serie.posterUrl ||
                      "https://via.placeholder.com/230x300?text=No+Image"
                    }
                    alt={serie.name}
                    className="movie-poster"
                  />

                  <div className="movie-info">
                    <h3>{serie.name}</h3>
                    <p className="rating">
                      ⭐ {serie.rating?.toFixed(1) || "N/A"}
                    </p>
                    <span className="release">{formatYear(serie)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 📄 Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="page-btn"
            >
              ← Prev
            </button>

            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="page-btn"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* 🎬 Modal */}
      {selectedSerie && (
        <div className="modal-overlay" onClick={() => setSelectedSerie(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedSerie(null)}>
              ×
            </button>

            <img
              src={
                selectedSerie.posterUrl ||
                "https://via.placeholder.com/400x600?text=No+Image"
              }
              alt={selectedSerie.name}
              className="modal-poster"
            />

            <div className="modal-details">
              <span className="modal-badge">Series</span>
              <h2>{selectedSerie.name}</h2>
              <p className="rating">
                ⭐ {selectedSerie.rating?.toFixed(1) || "N/A"}
              </p>
              <p className="release">{formatDate(selectedSerie)}</p>
              <p className="modal-overview">
                {selectedSerie.overview || "No description available."}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Series;
