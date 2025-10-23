const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  date: { type: Date, required: true },
  status: { type: String, enum: ["available", "pending", "confirmed", "cancelled", "completed"], default: "available" },
  recurrence: [{ type: String }],
  notes: { type: String, default: "" }
}, { timestamps: true });


module.exports = mongoose.model("Appointment", appointmentSchema);
