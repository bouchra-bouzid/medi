import { useState } from "react";
import axios from "axios";
import "./CustomSlotForm.css"; // <-- importer le CSS

const CustomSlotForm = ({ onCreated }) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time) return alert("Date et heure requises");

    try {
      const token = localStorage.getItem("token");
      const dateTime = `${date}T${time}`;
      await axios.post(
        "http://localhost:5000/api/appointments/slot",
        { date: dateTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Créneau créé !");
      setDate(""); setTime("");
      if (onCreated) onCreated();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur serveur");
    }
  };

  return (
    <form className="custom-slot-form" onSubmit={handleSubmit}>
      <label>Date :</label>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} required />

      <label>Heure :</label>
      <input type="time" value={time} onChange={e => setTime(e.target.value)} required />

      <button type="submit">Créer le créneau</button>
    </form>
  );
};

export default CustomSlotForm;
