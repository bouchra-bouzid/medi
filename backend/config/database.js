// config/database.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("❌ MONGO_URI non défini dans le fichier .env");

    console.log("⏳ Connexion à MongoDB...");

    await mongoose.connect(uri, {
      dbName: "meditime",           // ✅ force la bonne base
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    console.log("✅ MongoDB connecté avec succès à la base 'meditime' !");
  } catch (error) {
    console.error("❌ Erreur de connexion MongoDB :", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
