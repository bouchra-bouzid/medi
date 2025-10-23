import { useEffect, useState, useContext } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import "./DoctorAppointments.css";

const statusColor = {
  pending: "#fd7e14",
  confirmed: "green",
  cancelled: "#dc3545",
  completed: "#6c757d",
  available: "#6c757d",
};

// 🔹 Traduction des statuts
const statusLabel = {
  pending: "En attente",
  confirmed: "Confirmé",
  cancelled: "Annulé",
  completed: "Terminé",
  available: "Disponible",
};

// ⚡ Fonction pour formater la date locale (YYYY-MM-DD)
const formatDateLocal = (dateStr) => {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const DoctorAppointments = ({ refresh, onStatusChange }) => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filteredAppointments, setFilteredAppointments] = useState([]);

  const fetchAppointments = async () => {
    try {
      const res = await API.get("/appointments/doctor", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAppointments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(
        `/appointments/status/${id}`,
        { status },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchAppointments();
      if (onStatusChange) onStatusChange();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteSlot = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce créneau ?")) return;
    try {
      await API.delete(`/appointments/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Créneau supprimé !");
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur suppression créneau");
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [refresh]);

  useEffect(() => {
    if (!selectedDate) {
      setFilteredAppointments([]);
      return;
    }
    const selectedStr = formatDateLocal(selectedDate);
    setFilteredAppointments(
      appointments.filter(
        (a) => formatDateLocal(a.date) === selectedStr && a.patient
      )
    );
  }, [selectedDate, appointments]);

  return (
    <div>
      {/* Calendrier */}
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileClassName={({ date }) => {
          const dateStr = formatDateLocal(date);
          if (appointments.some((a) => formatDateLocal(a.date) === dateStr)) {
            return "has-appointment";
          }
        }}
      />

      {selectedDate === null ? (
        <p style={{ marginTop: "12px" }}>
          Veuillez sélectionner une date pour voir les rendez-vous.
        </p>
      ) : filteredAppointments.length === 0 ? (
        <p style={{ marginTop: "12px" }}>
          Aucun rendez-vous pour cette journée.
        </p>
      ) : (
        <div className="appointments-list">
          {filteredAppointments.map((a) => (
            <div key={a._id} className={`appointment-card ${a.status}`}>
              <div className="appointment-info">
                <div className="appointment-date">
                  {new Date(a.date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="appointment-patient">
                  {a.patient?.name || "Patient inconnu"}
                </div>

                {/* 🔹 Statut traduit avec couleur */}
                <span
                  className="status-badge"
                  style={{
                    backgroundColor: statusColor[a.status?.toLowerCase()],
                  }}
                >
                  {statusLabel[a.status?.toLowerCase()] || a.status}
                </span>
              </div>

              <div className="appointment-actions">
                {a.status === "pending" && a.patient && (
                  <>
                    <button
                      className="btn-confirm"
                      onClick={() => updateStatus(a._id, "confirmed")}
                    >
                      Confirmer
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() => updateStatus(a._id, "cancelled")}
                    >
                      Annuler
                    </button>
                  </>
                )}

                {a.status === "confirmed" && (
                  <>
                    <button  style={{ background: "#0d6efd" }}

                      className="btn-complete"
                      onClick={() => updateStatus(a._id, "completed")}
                    >
                      Terminer
                    </button >
                    <button
                      className="btn-cancel"
                      onClick={() => updateStatus(a._id, "cancelled")}
                    >
                      Annuler
                    </button>
                  </>
                )}

                {a.status === "available" && (
                  <button
                    className="btn-cancel"
                    onClick={() => deleteSlot(a._id)}
                  >
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
