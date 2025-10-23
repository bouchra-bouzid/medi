// controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ✅ Enregistrement (inchangé)
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ message: "Tous les champs sont obligatoires" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Cet email existe déjà" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      success: true,
      message: "Inscription réussie",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ✅ Connexion
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Mot de passe incorrect" });

    res.status(200).json({
      success: true,
      message: "Connexion réussie",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic || "",
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ✅ Mise à jour du profil (photo + mot de passe inclus)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, oldPassword, newPassword, profilePic } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // 🟢 Changer le mot de passe si oldPassword + newPassword fournis
    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch)
        return res.status(400).json({ message: "Ancien mot de passe incorrect" });

      user.password = await bcrypt.hash(newPassword, 10);
    }

    // 🟢 Mettre à jour le reste des infos
    if (name) user.name = name;
    if (email) user.email = email;
    if (profilePic) user.profilePic = profilePic; // base64 string envoyée par le front

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profil mis à jour avec succès",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic || "",
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
