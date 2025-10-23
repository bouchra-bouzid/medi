const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// 🔹 Récupérer le profil patient
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "patient") {
      return res.status(404).json({ message: "Patient non trouvé" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 🔹 Mettre à jour le profil patient
router.put("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "patient")
      return res.status(404).json({ message: "Patient non trouvé" });

    const { age, sexe, phone, address, oldPassword, newPassword, profilePic } = req.body;

    if (age !== undefined) user.age = age;
if (sexe !== undefined) user.sexe = sexe;
if (phone !== undefined) user.phone = phone;
if (address !== undefined) user.address = address;
if (profilePic !== undefined) user.profilePic = profilePic;


    // Photo
    if (profilePic) user.profilePic = profilePic;

    // Mot de passe
    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Ancien mot de passe incorrect" });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    user.updatedAt = Date.now();
    await user.save();

    res.json({
      message: "Profil mis à jour avec succès",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
