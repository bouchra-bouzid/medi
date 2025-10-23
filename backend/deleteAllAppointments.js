// deleteAllAppointments.js
const axios = require("axios");

// 🔹 Configurer ton token et l'URL backend
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
 // Token d'authentification
const baseURL = "http://localhost:5000"; // URL de ton backend

// 🔹 Supprimer tous les rendez-vous
const deleteAllAppointments = async () => {
  try {
    // 1️⃣ Récupérer tous les rendez-vous
    const res = await axios.get(`${baseURL}/appointments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    const appointments = res.data || [];
    if (appointments.length === 0) {
      console.log("Aucun rendez-vous à supprimer !");
      return;
    }

    console.log(`Suppression de ${appointments.length} rendez-vous...`);

    // 2️⃣ Boucle pour supprimer chaque rendez-vous
    for (const a of appointments) {
      try {
        await axios.delete(`${baseURL}/appointments/${a._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(`Rendez-vous ${a._id} supprimé ✅`);
      } catch (err) {
        console.error(`Erreur pour ${a._id} :`, err.response?.data || err.message);
      }
    }

    console.log("Tous les rendez-vous ont été traités.");
  } catch (err) {
    console.error("Erreur lors de la récupération des rendez-vous :");
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", err.response.data);
    } else {
      console.error(err.message);
    }
  }
};

// 🔹 Lancer le script
deleteAllAppointments();
