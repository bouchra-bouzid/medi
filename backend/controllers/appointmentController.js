const Appointment = require("../models/Appointment");
const User = require("../models/User");

// 🔹 Médecin crée un créneau disponible
exports.createSlot = async (req, res) => {
    try {
        if (req.user.role !== "doctor")
            return res.status(403).json({ message: "Seuls les médecins peuvent créer des créneaux" });

        const { date } = req.body;
        const slotDate = new Date(date);
        if (slotDate < new Date()) {
            return res.status(400).json({ message: "Impossible de créer un créneau dans le passé" });
        }

        const exists = await Appointment.findOne({ doctor: req.user.id, date: slotDate });
        if (exists) return res.status(400).json({ message: "Ce créneau existe déjà" });

        const slot = await Appointment.create({
            doctor: req.user.id,
            date: slotDate,
            status: "available"
        });

        res.status(201).json({ success: true, slot });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 🔹 Patient réserve un créneau
exports.bookAppointment = async (req, res) => {
    try {
        if (req.user.role !== "patient")
            return res.status(403).json({ message: "Seuls les patients peuvent réserver" });

        const { slotId } = req.body;
        const slot = await Appointment.findById(slotId);

        if (!slot) return res.status(404).json({ message: "Créneau introuvable" });
        if (slot.status !== "available") return res.status(400).json({ message: "Créneau déjà réservé" });
        if (new Date(slot.date) < new Date()) return res.status(400).json({ message: "Impossible de réserver un créneau passé" });

        slot.patient = req.user.id;
        slot.status = "pending";
        await slot.save();

        res.json({ success: true, slot });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 🔹 Médecin confirme, annule ou complète un rendez-vous
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body; // possibilité d'ajouter des notes
        const appointment = await Appointment.findById(id);
        if (!appointment) return res.status(404).json({ message: "Rendez-vous introuvable" });

        if (req.user.role === "doctor" && appointment.doctor.toString() === req.user.id) {
            if (!["available","pending","confirmed","cancelled","completed"].includes(status)) {
                return res.status(400).json({ message: "Status invalide" });
            }
            appointment.status = status;
            if (notes) appointment.notes = notes;
            await appointment.save();
            return res.json({ success: true, appointment });
        }

        res.status(403).json({ message: "Non autorisé" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 🔹 Liste des créneaux disponibles pour un patient
exports.getAvailableSlots = async (req, res) => {
    try {
        const slots = await Appointment.find({ status: "available", date: { $gte: new Date() } })
            .populate("doctor", "name specialty");
        res.json(slots);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 🔹 Récupérer tous les rendez-vous d’un médecin
exports.getDoctorAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctor: req.user.id })
            .populate("patient", "name email")
            .sort({ date: 1 }); // tri par date croissante
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 🔹 Récupérer les rendez-vous du patient
exports.getPatientAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ patient: req.user.id })
            .populate("doctor", "name specialty")
            .sort({ date: 1 });
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 🔹 Récupérer l'historique des rendez-vous passés
exports.getPastAppointments = async (req, res) => {
    try {
        let filter = { date: { $lt: new Date() } };
        if (req.user.role === "doctor") filter.doctor = req.user.id;
        if (req.user.role === "patient") filter.patient = req.user.id;

        const appointments = await Appointment.find(filter)
            .populate("doctor patient", "name specialty email")
            .sort({ date: -1 });
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 🔹 Patient annule un rendez-vous confirmé
exports.cancelAppointment = async (req, res) => {
    try {
        if (req.user.role !== "patient")
            return res.status(403).json({ message: "Seuls les patients peuvent annuler" });

        const { id } = req.params;
        const appointment = await Appointment.findById(id);

        if (!appointment) return res.status(404).json({ message: "Rendez-vous introuvable" });
        if (appointment.patient.toString() !== req.user.id)
            return res.status(403).json({ message: "Non autorisé" });

        if (appointment.status !== "confirmed" && appointment.status !== "pending")
            return res.status(400).json({ message: "Impossible d'annuler ce rendez-vous" });

        // Annuler le rendez-vous
        appointment.status = "available"; // redevenir disponible
        appointment.patient = null;
        await appointment.save();

        res.json({ success: true, message: "Rendez-vous annulé avec succès", appointment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createRecurringSlots = async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res.status(403).json({ message: "Seuls les médecins peuvent créer des créneaux" });

    const { startDate, endDate, timeRanges, recurrence, slotDuration } = req.body;

    if (!startDate || !endDate || !timeRanges || !recurrence || !slotDuration)
      return res.status(400).json({ message: "Informations manquantes" });

    const start = new Date(startDate);
    const end = new Date(endDate);
    const slots = [];

    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay().toString(); // 0 = Dimanche, 1 = Lundi, etc.

      if (recurrence.includes(dayOfWeek)) {
        timeRanges.forEach(range => {
          let startTime = new Date(`${current.toDateString()} ${range.start}`);
          const endTime = new Date(`${current.toDateString()} ${range.end}`);

          while (startTime.getTime() + slotDuration * 60000 <= endTime.getTime()) {
            slots.push({
              doctor: req.user.id,
              date: new Date(startTime),
              status: "available"
            });
            startTime = new Date(startTime.getTime() + slotDuration * 60000);
          }
        });
      }

      current.setDate(current.getDate() + 1); // passer au jour suivant
    }

    // Vérifier avant insertion
    console.log("Créneaux générés :", slots.length);

    const createdSlots = await Appointment.insertMany(slots);
    res.status(201).json({ success: true, slots: createdSlots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// body attendu : { date: "2025-10-22T09:00" }
exports.createSlot = async (req, res) => {
    try {
        if (req.user.role !== "doctor")
            return res.status(403).json({ message: "Seuls les médecins peuvent créer des créneaux" });

        const { date } = req.body;
        const slotDate = new Date(date);
        if (slotDate < new Date()) {
            return res.status(400).json({ message: "Impossible de créer un créneau dans le passé" });
        }

        const exists = await Appointment.findOne({ doctor: req.user.id, date: slotDate });
        if (exists) return res.status(400).json({ message: "Ce créneau existe déjà" });

        const slot = await Appointment.create({
            doctor: req.user.id,
            date: slotDate,
            status: "available"
        });

        res.status(201).json({ success: true, slot });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 🔹 Médecin supprime un créneau disponible
exports.deleteSlot = async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res.status(403).json({ message: "Seuls les médecins peuvent supprimer des créneaux" });

    const { id } = req.params;
    const slot = await Appointment.findById(id);
    if (!slot) return res.status(404).json({ message: "Créneau introuvable" });
    if (slot.doctor.toString() !== req.user.id)
      return res.status(403).json({ message: "Non autorisé" });
    if (slot.status !== "available")
      return res.status(400).json({ message: "Impossible de supprimer un créneau réservé" });

    await slot.deleteOne();
    res.json({ success: true, message: "Créneau supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Récupérer les créneaux d'un médecin (ex : pour la modal profil -> patients)
exports.getSlotsByDoctorPublic = async (req, res) => {
  try {
    const { doctorId } = req.params;
    if (!doctorId) return res.status(400).json({ message: "doctorId manquant" });

    // On retourne uniquement les créneaux "available" à destination des patients.
    const slots = await Appointment.find({
      doctor: doctorId,
      status: "available",
      date: { $gte: new Date() } // seulement futurs
    }).sort({ date: 1 }).populate("doctor", "name specialty address");

    res.json(slots);
  } catch (err) {
    console.error("getSlotsByDoctorPublic error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
