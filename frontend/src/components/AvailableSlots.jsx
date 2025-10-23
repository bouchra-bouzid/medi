import { useEffect, useState } from "react";
import API from "../services/api";
import "./AvailableSlots.css";
import { FaTrash } from "react-icons/fa";


const statusColor = {
  available: "green",
  pending: "orange",
  confirmed: "blue",
  cancelled: "red",
  completed: "gray",
};



const AvailableSlots = ({ doctorId, forPatient = false, onBooked }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSlots = async () => {
  try {
    setLoading(true);

    const endpoint = doctorId
      ? `/appointments/doctor/${doctorId}`
      : "/appointments/mine"; // ✅ route pour le médecin connecté

    const res = await API.get(endpoint, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    setSlots(res.data || []);
  } catch (err) {
    console.error("Erreur fetchSlots:", err);
  } finally {
    setLoading(false);
  }
};



  const bookSlot = async (slotId) => {
    try {
      const res = await API.post(
        "/appointments/book",
        { slotId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("✅ Rendez-vous réservé !");
      if (onBooked) onBooked();
      fetchSlots();
    } catch (err) {
      console.error("Erreur réservation:", err);
      alert(err.response?.data?.message || "Erreur lors de la réservation");
    }
  };
  const deleteSlot = async (slotId) => {
  if (!window.confirm("Voulez-vous vraiment supprimer ce créneau ?")) return;

  try {
    await API.delete(`/appointments/${slotId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    alert("✅ Créneau supprimé !");
    fetchSlots(); // refresh
  } catch (err) {
    console.error("Erreur suppression créneau:", err);
    alert(err.response?.data?.message || "Erreur lors de la suppression");
  }

};


  useEffect(() => {
    fetchSlots();
  }, [doctorId]);

  if (loading) return <p>Chargement des créneaux...</p>;

  return (
    <div className="slots-container">
      {slots.length === 0 ? (
        <p>Aucun créneau disponible pour ce médecin.</p>
      ) : (
        <ul>
          {slots.map((slot) => (
            <li key={slot._id}>
  <span>{new Date(slot.date).toLocaleString()}</span>

  {/* Bouton réserver pour les patients */}
  {forPatient && slot.status === "available" && (
    <button className="book-btn" onClick={() => bookSlot(slot._id)}>
      Réserver
    </button>
  )}
  
  { /*AAAAAAAAAAAAAAAAAAAAAAAAAAA*/}
{!forPatient && slot.status === "available" && (
  <button
    className="delete-btn"
    onClick={() => deleteSlot(slot._id)}
  >
    <FaTrash />
  </button>
)}



  
</li>

          ))}
        </ul>

      )}
    </div>
  );
};

export default AvailableSlots;
