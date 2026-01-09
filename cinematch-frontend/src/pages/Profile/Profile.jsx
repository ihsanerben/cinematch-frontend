import React, { useEffect, useState } from "react";
import "./Profile.css";
import Navbar from "../Navbar/Navbar.jsx";
import api from "../../api/axios";
import quotes from "../../data/quotes.json"; // 🎯 JSON'dan quote alıyoruz

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [randomQuote, setRandomQuote] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        console.error("User bilgiler alınamadı:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // 🎬 Rastgele bir film repliği seç
    if (quotes && quotes.quotes) {
      const random =
        quotes.quotes[Math.floor(Math.random() * quotes.quotes.length)];
      setRandomQuote(random);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("userName");

    window.location.href = "/login";
  };

  return (
    <>
      <Navbar />

      <div className="profile-container">
        {loading || !user ? (
          <div className="profile-card">
            <p style={{ margin: 0 }}>
              {loading ? "Loading..." : "Could not load user data."}
            </p>
          </div>
        ) : (
          <div className="profile-card">
            <h2 className="profile-name">{user.name}</h2>
            <p className="profile-email">{user.email}</p>

            <p className="profile-joined">
              Joined: {new Date(user.createdAt).toLocaleDateString()}
            </p>

            <div className="quote-box">
              <h3>🎬 Daily Quote</h3>
              <p>"{randomQuote}"</p>
            </div>

            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;
