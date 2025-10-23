import React, { useState } from "react";
import API from "../services/api";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/contact", formData);
      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      alert("Erreur lors de l'envoi du message");
      console.error(err);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #e3f2fd, #fff8e1)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "720px",
          width: "100%",
          padding: "40px 30px",
          borderRadius: "15px",
          backgroundColor: "#f1f3f5",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1
          style={{
            color: "#0d6efd",
            textAlign: "center",
            marginBottom: "25px",
            fontSize: "1.8rem",
            fontWeight: "700",
          }}
        >
          Contactez-nous
        </h1>

        {submitted && (
          <p
            style={{
              textAlign: "center",
              color: "#198754",
              fontWeight: "600",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            ✅ Merci ! Votre message a été envoyé.
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Votre nom"
            value={formData.name}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              marginBottom: "15px",
              fontSize: "15px",
              outline: "none",
              transition: "border-color 0.3s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#0d6efd")}
            onBlur={(e) => (e.target.style.borderColor = "#ccc")}
          />

          <input
            type="email"
            name="email"
            placeholder="Votre email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              marginBottom: "15px",
              fontSize: "15px",
              outline: "none",
              transition: "border-color 0.3s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#0d6efd")}
            onBlur={(e) => (e.target.style.borderColor = "#ccc")}
          />

          <textarea
            name="message"
            placeholder="Votre message"
            value={formData.message}
            onChange={handleChange}
            required
            rows="5"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              marginBottom: "20px",
              fontSize: "15px",
              resize: "none",
              outline: "none",
              transition: "border-color 0.3s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#0d6efd")}
            onBlur={(e) => (e.target.style.borderColor = "#ccc")}
          ></textarea>

          <button
            type="submit"
            style={{
              width: "100%",
              backgroundColor: "#0d6efd",
              color: "white",
              fontWeight: "600",
              border: "none",
              padding: "12px",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "16px",
              transition: "background-color 0.3s, transform 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#0b5ed7")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#0d6efd")}
            onMouseDown={(e) => (e.target.style.transform = "scale(0.97)")}
            onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
          >
            Envoyer
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
