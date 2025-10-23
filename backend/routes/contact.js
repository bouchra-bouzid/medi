const express = require("express");
const router = express.Router();
const Contact = require("../models/contact");

router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Champs manquants" });
    }

    const newMessage = new Contact({ name, email, message });
    await newMessage.save();

    console.log("✅ Message enregistré :", newMessage);
    res.json({ success: true, message: "Message enregistré avec succès !" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
