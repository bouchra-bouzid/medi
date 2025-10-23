const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Message = require("../models/Message"); // ✅ important !
const {
  sendMessage,
  getConversation,
  getPatientsWithUnread,
  markAsRead,
  getDoctorsWithUnread,
} = require("../controllers/messageController");

// Envoyer un message
router.post("/", sendMessage);

// Conversation entre deux utilisateurs
router.get("/conversation/:userId/:otherId", getConversation);

// Récupérer tous les patients avec messages non lus pour un médecin
router.get("/patients/unread/:id", getPatientsWithUnread);


router.get("/doctors/unread/:id", getDoctorsWithUnread);

// 🔹 Marquer les messages entre deux utilisateurs comme lus
router.put("/mark-read/:readerId/:otherId", async (req, res) => {
  try {
    await Message.updateMany(
      { senderId: req.params.otherId, receiverId: req.params.readerId, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Erreur mark-read:", err);
    res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
});


// ✅ Liste des médecins avec lesquels un patient a déjà échangé
// 🔹 Liste des médecins avec lesquels un patient a discuté (avec badge si message non lu)
router.get("/doctors/active/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;

    const messages = await Message.find({
      $or: [{ senderId: patientId }, { receiverId: patientId }],
    }).populate("senderId receiverId", "name email role profilePic");

    if (!messages.length) return res.json([]);

    const doctorMap = {};

    messages.forEach((msg) => {
      const isDoctorSender = msg.senderId.role === "doctor";
      const doctor = isDoctorSender ? msg.senderId : msg.receiverId;

      if (!doctorMap[doctor._id]) {
        doctorMap[doctor._id] = { ...doctor.toObject(), unreadCount: 0 };
      }

      // Compter les messages non lus
      if (
        msg.receiverId._id.toString() === patientId &&
        msg.senderId.role === "doctor" &&
        !msg.read
      ) {
        doctorMap[doctor._id].unreadCount += 1;
      }
    });

    res.json(Object.values(doctorMap));
  } catch (err) {
    console.error("Erreur doctors/active:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


router.get("/patients/active/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;

    const messages = await Message.find({
      $or: [{ senderId: doctorId }, { receiverId: doctorId }],
    }).populate("senderId receiverId", "name email role profilePic");

    if (!messages.length) return res.json([]);

    const patientMap = {};

    messages.forEach((msg) => {
      const isPatientSender = msg.senderId.role === "patient";
      const patient = isPatientSender ? msg.senderId : msg.receiverId;

      // ✅ Ajouter tous les patients ayant une conversation
      if (!patientMap[patient._id]) {
        patientMap[patient._id] = { ...patient.toObject(), unreadCount: 0 };
      }

      // ✅ Compter les messages non lus envoyés par le patient au médecin
      if (
        msg.receiverId._id.toString() === doctorId &&
        msg.senderId.role === "patient" &&
        !msg.read
      ) {
        patientMap[patient._id].unreadCount += 1;
      }
    });

    res.json(Object.values(patientMap));
  } catch (err) {
    console.error("Erreur patients/active:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


module.exports = router;
