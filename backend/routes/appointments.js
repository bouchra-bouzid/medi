const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const appointmentController = require("../controllers/appointmentController");
const Appointment = require("../models/Appointment"); // Vérifie le chemin exact

// 🔹 Médecin crée un créneau
router.post("/slot", protect, appointmentController.createSlot);

// 🔹 Médecin crée des créneaux récurrents
router.post("/slot/recurring", protect, appointmentController.createRecurringSlots);

// 🔹 Patient réserve un créneau
router.post("/book", protect, appointmentController.bookAppointment);

// 🔹 Médecin confirme / annule / complète un rendez-vous
router.put("/status/:id", protect, appointmentController.updateStatus);

// 🔹 Patient annule un rendez-vous
router.put("/cancel/:id", protect, appointmentController.cancelAppointment);

// 🔹 Liste des créneaux disponibles pour les patients
router.get("/available", protect, appointmentController.getAvailableSlots);

// 🔹 Liste des rendez-vous du médecin
router.get("/doctor", protect, appointmentController.getDoctorAppointments);

// 🔹 Liste des rendez-vous du patient
router.get("/patient", protect, appointmentController.getPatientAppointments);

// 🔹 Historique des rendez-vous passés (médecin et patient)
router.get("/history", protect, appointmentController.getPastAppointments);

// route publique pour récupérer les créneaux d'un médecin
router.get("/doctor/:doctorId", appointmentController.getSlotsByDoctorPublic);

// 🩵 Route pour le médecin connecté
// 🔹 Récupérer les créneaux du médecin connecté
router.get("/mine", protect, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const slots = await Appointment.find({ doctor: req.user._id });
    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 🔹 Récupérer les rendez-vous non lus pour un médecin
router.get("/unread/:doctorId", protect, async (req, res) => {
  try {
    const { doctorId } = req.params;
    console.log("Backend: fetch unread appointments pour doctorId:", doctorId);

    // Cherche les rendez-vous avec status "unread" pour ce médecin
    const unreadAppointments = await Appointment.find({
      doctor: doctorId,
      status: "unread",
    });

    res.json({
      count: unreadAppointments.length,
      appointments: unreadAppointments,
    });
  } catch (err) {
    console.error("Erreur fetch unread appointments:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


// 🔹 Supprimer un créneau (médecin)
router.delete("/:id", protect, async (req, res) => {
  try {
    const slot = await Appointment.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({ message: "Créneau non trouvé" });
    }

    // Vérifier que le créneau appartient au médecin connecté
    if (slot.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    // AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
    if (slot.status !== "available") {
      return res.status(400).json({ message: "Impossible de supprimer un rendez-vous déjà pris" });
    }

    await slot.deleteOne();
    res.json({ message: "Créneau supprimé avec succès !" });
  } catch (err) {
    console.error("Erreur suppression créneau:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


module.exports = router;
