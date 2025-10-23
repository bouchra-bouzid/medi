// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/database"); // ✅ Connexion MongoDB

dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/doctors", require("./routes/doctors"));
app.use("/api/patients", require("./routes/patients"));
app.use("/api/appointments", require("./routes/appointments"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/contact", require("./routes/contact"));



// ✅ Connexion + démarrage serveur
const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Impossible de démarrer le serveur :", err.message);
  });


  