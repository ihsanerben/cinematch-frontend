import React, { useState } from "react";
import api from "../../api/axios"; 
import "./Login.css";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      alert("✅ Login Successful!");
      console.log("User Data:", response.data);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userData", JSON.stringify(response.data)); 
      localStorage.setItem("userName", response.data.userEmail); 

      navigate("/profile"); 
    } catch (err) {
      console.error(err);
      alert("❌ Login Failed: " + (err.response?.data?.error || "Invalid credentials"));
    }
  };

  return (
    <>
      <Navbar />

      <div className="login-wrapper">

        <div className="login-card">
          <h2 className="login-title">🎥 Welcome Back</h2>

          <form onSubmit={handleSubmit}>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <button type="submit" className="login-btn">
              Log In
            </button>

            <p className="register-text">
              Don’t have an account? <a href="/register">Create one</a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}