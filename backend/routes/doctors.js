const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// 🔹 Récupérer tous les médecins
router.get("/", async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select(
      "name specialty bio experience phone profilePic "
    );
    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 🔹 Récupérer un médecin par ID
router.get("/:id", async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id).select(
      "name specialty bio experience phone profilePic role address email"
    );
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Médecin non trouvé" });
    }
    res.json(doctor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 🔹 Mettre à jour un médecin
router.put("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "doctor") {
      return res.status(404).json({ message: "Médecin non trouvé" });
    }

    // Champs à mettre à jour
    const fields = ["name", "email", "specialty", "bio", "experience", "phone", "address", "profilePic"];
    fields.forEach(f => {
      if (req.body[f] !== undefined) user[f] = req.body[f]; // ne met à jour que si non vide
    });

    // Mot de passe
    const { oldPassword, newPassword } = req.body;
    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: "Ancien mot de passe incorrect" });
      user.password = await bcrypt.hash(newPassword, 10);
    }

    user.updatedAt = Date.now();
    await user.save();

    // ⚡ Réponse unique
    res.json({ message: "Profil mis à jour avec succès", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
