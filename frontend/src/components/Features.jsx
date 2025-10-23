// src/components/Features.jsx
import React from "react";
import "./Features.css";

const featuresData = [
  { title: "Consultation rapide", desc: "Prenez des rendez-vous en quelques clics." },
  { title: "Médecins qualifiés", desc: "Nos médecins sont certifiés et expérimentés." },
  { title: "Historique complet", desc: "Suivez vos rendez-vous passés et futurs." },
];

const Features = () => {
  return (
    <section className="features">
      {featuresData.map((feature, index) => (
        <div key={index} className="feature-card">
          <h3>{feature.title}</h3>
          <p>{feature.desc}</p>
        </div>
      ))}
    </section>
  );
};

export default Features;
