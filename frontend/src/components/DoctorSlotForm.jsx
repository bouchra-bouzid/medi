import { useState } from "react";
import axios from "axios";
import "./DoctorSlotForm.css";

const daysOfWeek = [
  { label: "Lundi", value: "1" },
  { label: "Mardi", value: "2" },
  { label: "Mercredi", value: "3" },
  { label: "Jeudi", value: "4" },
  { label: "Vendredi", value: "5" },
  { label: "Samedi", value: "6" },
  { label: "Dimanche", value: "0" },
];

const DoctorSlotForm = ({ onCreated }) => {
  const [selectedDays, setSelectedDays] = useState([]);
  const [slotDuration, setSlotDuration] = useState(30);
  const [timeRanges, setTimeRanges] = useState([{ start: "", end: "" }]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleTimeChange = (index, field, value) => {
    const newRanges = [...timeRanges];
    newRanges[index][field] = value;
    setTimeRanges(newRanges);
  };

  const addTimeRange = () => setTimeRanges([...timeRanges, { start: "", end: "" }]);
  const removeTimeRange = (index) => setTimeRanges(timeRanges.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDays.length) return alert("Sélectionnez au moins un jour");
    if (!startDate || !endDate) return alert("Dates manquantes");
    if (!timeRanges[0].start || !timeRanges[0].end) return alert("Heures manquantes");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/appointments/slot/recurring",
        { startDate, endDate, timeRanges, recurrence: selectedDays, slotDuration },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Créneaux créés !");
      setSelectedDays([]);
      setTimeRanges([{ start: "", end: "" }]);
      setSlotDuration(30);
      setStartDate("");
      setEndDate("");
      if (onCreated) onCreated();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur serveur");
    }
  };

  return (
    <form className="doctor-slot-form" onSubmit={handleSubmit}>
      <label>Jours de la semaine :</label>
      <div className="days-selector">
  {daysOfWeek.map(day => (
    <label 
      key={day.value} 
      className={`day-checkbox ${selectedDays.includes(day.value) ? 'active' : ''}`}
    >
      <input
        type="checkbox"
        value={day.value}
        checked={selectedDays.includes(day.value)}
        onChange={() => toggleDay(day.value)}
      />
      {day.label[0]} {/* on met juste la première lettre du jour */}
    </label>
  ))}
</div>


      <label>Date de début :</label>
      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />

      <label>Date de fin :</label>
      <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />

      <label>Durée d'un créneau (minutes) :</label>
      <input
        type="number"
        min="5"
        max="180"
        value={slotDuration}
        onChange={e => setSlotDuration(e.target.value)}
        required
      />

      <label>Plages horaires :</label>
<div className="time-range-container">
  {timeRanges.map((range, index) => (
    <div key={index} className="time-range">
    
      <input
        type="time"
        value={range.start}
        onChange={e => handleTimeChange(index, "start", e.target.value)}
        required
      />
      <span>à</span>
      <input
        type="time"
        value={range.end}
        onChange={e => handleTimeChange(index, "end", e.target.value)}
        required
      />
      {index === 0 && (
        <button type="button" className="add-range-btn" onClick={addTimeRange} title="Ajouter une plage">+</button>
      )}
      {index > 0 && (
        <button type="button" className="remove-range-btn" onClick={() => removeTimeRange(index)}>×</button>
      )}
    </div>
  ))}
</div>

      <button type="submit" className="submit-slot-btn">Créer les créneaux</button>
    </form>
  );
};

export default DoctorSlotForm;
