const express = require("express");
const router = express.Router();
const User = require("../models/User"); // ton model User
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🟢 Inscription
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ message: "Tous les champs sont requis" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email déjà utilisé" });

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await user.save();
    res.status(201).json({ message: "Inscription réussie" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🟢 Connexion
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "Email ou mot de passe incorrect" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Email ou mot de passe incorrect" });

    // Génération JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🟢 Mise à jour du profil utilisateur (mot de passe + infos)
router.put("/update/:id", async (req, res) => {
  try {
    const { name, email, oldPassword, newPassword, photo } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    // Mise à jour des champs de base
    if (name) user.name = name;
    if (email) user.email = email;
    if (photo) user.photo = photo;

    // Vérifie et met à jour le mot de passe
    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch)
        return res.status(400).json({ message: "Ancien mot de passe incorrect" });

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedNewPassword;
    }

    await user.save();

    res.json({
      success: true,
      message: "Profil mis à jour avec succès",
      user,
    });
  } catch (err) {
    console.error("Erreur maj profil:", err);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour" });
  }
});

module.exports = router;
