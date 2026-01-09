import React, { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import quotesData from "../../data/welcome.json";

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [userName, setUserName] = useState("");
  const [quote, setQuote] = useState("");
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [fade, setFade] = useState(false);

  const taglines = [
    "🎬 Discover stories.",
    "💫 Match your vibe.",
    "🍿 Your next favorite awaits.",
    "🎞 Cinema that feels personal.",
  ];

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) setUserName(storedName);

    const q = quotesData.quotes;
    setQuote(q[Math.floor(Math.random() * q.length)]);

    const interval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setTaglineIndex((prev) => (prev + 1) % taglines.length);
        setFade(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [taglines.length]);

  const handleStart = () => {
    if (!token) navigate("/login");
    else navigate("/recommendations");
  };

  return (
    <>
      <Navbar />

      <div className="home-hero">
        <div className="home-overlay" />

        <div className="home-content">
          <h1 className="home-title">
            <p  >Welcome to CineMatch🎬</p>
            <p
              style={{
                fontSize: 15,
                color: "#ff4444",
              }}
            >
              {token && userName ? `${userName}` : ""}
            </p>
          </h1>
          <br />
          <p className={`home-tagline ${fade ? "fade-out" : "fade-in"}`}>
            {taglines[taglineIndex]}
          </p>

          <p className="home-quote">“{quote}”</p>
<br />
          <button onClick={handleStart} className="home-start-btn">
            {"Get Started 🚀"}
          </button>
        </div>
      </div>
    </>
  );
}
