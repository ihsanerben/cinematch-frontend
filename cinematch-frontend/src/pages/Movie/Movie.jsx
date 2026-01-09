import React, { useEffect, useState } from "react";
import { FaThumbsUp, FaBars } from "react-icons/fa";
import "./Movie.css";
import Navbar from "../Navbar/Navbar.jsx";
import api from "../../api/axios";

const Movie = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState([]); 
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("highestRated");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 20;
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

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await api.get("/movies");
        setMovies(res.data || []);
      } catch (err) {
        console.error("Film verisi alınamadı:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchFavorites = async () => {
      if (!isLoggedIn) return;
      try {
        const res = await api.get("/favorites/movie"); // FavoriteResponseMovie[]
        const ids = (res.data || []).map((f) => f.contentId); // backend'de contentId = movie.id
        setFavoriteIds(ids);
      } catch (err) {
        console.log("Favoriler alınamadı:", err);
      }
    };

    fetchMovies();
    fetchFavorites();
  }, [isLoggedIn]);

  const toggleFavorite = async (movieId, isFav) => {
    try {
      console.log("Gönderilen movieId:", movieId);

      if (isFav) {
        const res = await api.delete(`/favorites/movie/${movieId}`);
        console.log("Remove response:", res.data);
        setFavoriteIds((prev) => prev.filter((id) => id !== movieId));
      } else {
        const res = await api.post(`/favorites/movie/${movieId}`);
        console.log("Add response:", res.data);
        setFavoriteIds((prev) => [...prev, movieId]);
      }
    } catch (err) {
      console.error("Favori API HATASI:", err.response?.data || err);
    }
  };

  // 🔎 Filtre + sıralama
  const filteredMovies = movies
    .filter(
      (m) =>
        m &&
        m.title &&
        m.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === "highestRated") return (b.rating || 0) - (a.rating || 0);
      if (sortOption === "newest")
        return new Date(b.releaseDate) - new Date(a.releaseDate);
      if (sortOption === "oldest")
        return new Date(a.releaseDate) - new Date(b.releaseDate);
      return 0;
    });

  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleMovies = filteredMovies.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <>
      <Navbar />

      <div className="home-container">
        <div className="home-header">
          <h1 className="home-slogan">
            Discover the best movies for your next watch 🎬
          </h1>
        </div>

        <div className="filter-bar">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search movies..."
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

        {/* 🎞️ Film listesi */}
        {loading ? (
          <p className="loading">Loading movies...</p>
        ) : (
          <>
            <div className="movie-grid">
              {visibleMovies.map((movie) => {
                const isFav = favoriteIds.includes(movie.id);

                return (
                  <div
                    key={movie.id}
                    className="movie-card"
                    onClick={() => setSelectedMovie(movie)}
                  >
                    <div
                      className="thumb-wrapper"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(movie.id, isFav);
                      }}
                    >
                      <FaThumbsUp
                        className={`thumb-icon ${isFav ? "active" : ""}`}
                      />
                    </div>

                    <img
                      src={
                        movie.posterUrl ||
                        "https://via.placeholder.com/230x300?text=No+Image"
                      }
                      alt={movie.title}
                      className="movie-poster"
                    />

                    <div className="movie-info">
                      <h3>{movie.title}</h3>
                      <p className="rating">
                        ⭐ {movie.rating?.toFixed(1) || "N/A"}
                      </p>
                      <span className="release">{formatYear(movie)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 📄 Sayfalama */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="page-btn"
                >
                  ← Prev
                </button>
                <span className="page-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="page-btn"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 🎬 Modal */}
      {selectedMovie && (
        <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedMovie(null)}>
              ×
            </button>

            <img
              src={
                selectedMovie.posterUrl ||
                "https://via.placeholder.com/400x600?text=No+Image"
              }
              alt={selectedMovie.title}
              className="modal-poster"
            />
            <div className="modal-details">
              <span className="modal-badge">Movie</span>
              <h2>{selectedMovie.title}</h2>
              <p className="rating">
                ⭐ {selectedMovie.rating?.toFixed(1) || "N/A"}
              </p>
              <p className="release">{formatDate(selectedMovie)}</p>
              <p className="modal-overview">
                {selectedMovie.overview || "No description available."}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Movie;