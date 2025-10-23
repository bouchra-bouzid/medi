const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["doctor", "patient"], required: true },

  // Médecin
  specialty: { type: String },
  bio: { type: String },
  experience: { type: String },
  phone: { type: String },
  // Universel pour tous
address: { type: String, default: "" },
 // pour patient et médecin


  // Patient
  age: { type: String },
  sexe: { type: String },
  address: { type: String },

  // Nouveau : photo de profil
  profilePic: { type: String, default: "" },

  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
