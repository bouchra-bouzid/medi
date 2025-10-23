const Message = require("../models/Message");
const User = require("../models/User");

// Envoyer un message
exports.sendMessage = async (req, res) => {
  const { senderId, senderName, receiverId, text } = req.body;
  if (!senderId || !receiverId || !text) return res.status(400).json({ message: "Champs manquants" });
  const message = new Message({ senderId, senderName, receiverId, text });
  await message.save();
  res.status(201).json(message);
};

// Récupérer les messages entre deux utilisateurs
exports.getConversation = async (req, res) => {
  const { userId, otherId } = req.params;
  const conversation = await Message.find({
    $or: [
      { senderId: userId, receiverId: otherId },
      { senderId: otherId, receiverId: userId },
    ]
  }).sort({ createdAt: 1 });
  res.json(conversation);
};

// Récupérer tous les patients qui ont envoyé un message non lu à un médecin
exports.getPatientsWithUnread = async (req, res) => {
  const doctorId = req.params.id;
  const messages = await Message.find({ receiverId: doctorId, read: false }).sort({ createdAt: -1 });
  const patientIds = [...new Set(messages.map(m => m.senderId.toString()))];
  const patients = await User.find({ _id: { $in: patientIds } }).select("name _id");
  res.json(patients);
};

// Marquer les messages comme lus
exports.markAsRead = async (req, res) => {
  const { userId, otherId } = req.params; // userId = médecin
  await Message.updateMany({ senderId: otherId, receiverId: userId }, { read: true });
  res.json({ success: true });
};
// messageController.js
exports.getDoctorsWithUnread = async (req, res) => {
  const patientId = req.params.id;
  const messages = await Message.find({ receiverId: patientId, read: false }).sort({ createdAt: -1 });
  const doctorIds = [...new Set(messages.map(m => m.senderId.toString()))];
  const doctors = await User.find({ _id: { $in: doctorIds }, role: "doctor" }).select("name _id");
  res.json(doctors);
};

