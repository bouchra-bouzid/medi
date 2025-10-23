import React, { useState } from "react";
import "./Pages.css";

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  // Fonction pour gérer l'ouverture et la fermeture des réponses
  const toggleAnswer = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      <h1>FAQ - Questions fréquentes</h1>

      <div className="faq-item">
        <h3 onClick={() => toggleAnswer(0)} className="faq-question">
          1. Comment prendre rendez-vous ?
        </h3>
        {activeIndex === 0 && (
          <p className="faq-answer">
            Vous devez créer un compte, vous connecter et choisir un médecin pour réserver un créneau disponible.
          </p>
        )}
      </div>

      <div className="faq-item">
        <h3 onClick={() => toggleAnswer(1)} className="faq-question">
          2. Puis-je annuler ou modifier un rendez-vous ?
        </h3>
        {activeIndex === 1 && (
          <p className="faq-answer">
            Oui, vous pouvez annuler ou modifier vos rendez-vous via votre tableau de bord patient, tant que le créneau n’est pas passé.
          </p>
        )}
      </div>

      <div className="faq-item">
        <h3 onClick={() => toggleAnswer(2)} className="faq-question">
          3. La messagerie est-elle sécurisée ?
        </h3>
        {activeIndex === 2 && (
          <p className="faq-answer">
            Oui, tous les messages entre patients et médecins sont cryptés et privés.
          </p>
        )}
      </div>

      <div className="faq-item">
        <h3 onClick={() => toggleAnswer(3)} className="faq-question">
          4. Comment contacter le support ?
        </h3>
        {activeIndex === 3 && (
          <p className="faq-answer">
            Vous pouvez nous contacter par email à contact@meditime.com ou via le formulaire sur la page Contact.
          </p>
        )}
      </div>

      {/* Optionnel : Section de questions supplémentaires */}
      <div className="more-questions">
        <p>Si vous n'avez pas trouvé votre réponse, vous pouvez nous poser une question via notre page Contact.</p>
      </div>
    </div>
  );
};

export default FAQ;
