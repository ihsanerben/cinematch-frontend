import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "./Register.css";
import bgImage from "../../assets/auth/background.png";
import Navbar from "../Navbar/Navbar";
import api from "../../api/axios";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
    birthDate: "",
  });

  const [validity, setValidity] = useState({
    minChar: false,
    upper: false,
    number: false,
  });

  const [error, setError] = useState(""); // Genel hata mesajlarını göstermek için

  // Regex: Genel email formatı kontrolü
  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const validatePassword = (pass) => {
    setValidity({
      minChar: pass.length >= 8,
      upper: /[A-Z]/.test(pass),
      number: /[0-9]/.test(pass),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "password") validatePassword(value);
    if (error) setError(""); // Yazmaya başlayınca hatayı temizle
  };

  const handlePhoneChange = (value) => {
    setForm((prev) => ({ ...prev, phone: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Email Kontrolü
    if (!validateEmail(form.email)) {
      setError("Please enter a valid email address (e.g. name@gmail.com)");
      return;
    }

    // 2. Şifre Kontrolü
    if (!validity.minChar || !validity.upper || !validity.number) {
      setError("Password criteria not met.");
      return;
    }

    // 3. Telefon Kontrolü (PhoneInput min karakter kontrolü)
    if (form.phone.length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }

    // 4. Yaş Kontrolü (Opsiyonel: 18 yaş sınırı)
    const birthYear = new Date(form.birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    if (currentYear - birthYear < 18) {
      setError("You must be at least 18 years old to register.");
      return;
    }

    try {
      await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        phoneNumber: form.phone,
        gender: form.gender,
        birthDate: form.birthDate,
      });

      alert("🎉 Registration Successful!");
      navigate("/login");
    } catch (error) {
      const responseData = error.response?.data;
      const message =
        (responseData && typeof responseData === "object" && responseData.message) ||
        (typeof responseData === "string" && responseData) ||
        "An error occurred during registration.";
      setError(message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="register-wrapper" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="register-card">
          <h2 className="register-title">🎬 Create Your Account</h2>

          {/* Hata Mesajı Paneli */}
          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-row">
              <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
              <select name="gender" value={form.gender} onChange={handleChange} required>
                <option value="">Gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>

            <label className="input-label">Birth Date</label>
            <input type="date" name="birthDate" value={form.birthDate} onChange={handleChange} required />
            
            <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
            
            <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
            
            <div className="password-validator">
              <div className={`criterion ${validity.minChar ? "valid" : ""}`}>
                <span>{validity.minChar ? "✔" : "✖"}</span> At least 8 characters
              </div>
              <div className={`criterion ${validity.upper ? "valid" : ""}`}>
                <span>{validity.upper ? "✔" : "✖"}</span> One uppercase letter
              </div>
              <div className={`criterion ${validity.number ? "valid" : ""}`}>
                <span>{validity.number ? "✔" : "✖"}</span> One number
              </div>
            </div>

            <div className="phone-wrapper">
              <PhoneInput 
                country={"tr"} 
                value={form.phone} 
                onChange={handlePhoneChange}
                inputStyle={{ width: "100%", background: "rgba(0, 0, 0, 0.4)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "12px", color: "white", height: "50px" }}
                dropdownStyle={{ backgroundColor: "#1a1a1a", color: "white" }}
              />
            </div>

            <button type="submit" className="register-btn">Register</button>
            <p className="login-text">Already a member? <Link to="/login">Log in</Link></p>
          </form>
        </div>
      </div>
    </>
  );
}
