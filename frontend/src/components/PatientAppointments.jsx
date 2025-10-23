import { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import "./PatientAppointments.css";

const statusColor = {
  pending: "orange",
  confirmed: "green",
  cancelled: "red",
  completed: "gray",
};

// 🔹 Traduction des statuts
const statusLabel = {
  pending: "En attente",
  confirmed: "Confirmé",
  cancelled: "Annulé",
  completed: "Terminé",
};

const PatientAppointments = ({ refresh }) => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);

  const fetchAppointments = async () => {
    try {
      const res = await API.get("/appointments/patient", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [refresh]);

  const cancelAppointment = async (id) => {
    if (!window.confirm("Voulez-vous vraiment annuler ce rendez-vous ?")) return;
    try {
      await API.put(
        `/appointments/cancel/${id}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Rendez-vous annulé !");
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'annulation");
    }
  };

  return (
    <div className="appointments-container">
      {appointments.length === 0 ? (
        <p className="no-appointments">Aucun rendez-vous</p>
      ) : (
        <ul className="appointments-list">
          {appointments.map((a) => (
            <li
              key={a._id}
              className="appointment-item"
              style={{ borderLeft: `4px solid ${statusColor[a.status] || "black"}` }}
            >
              <div className="appointment-info">
                <span>
                  <strong>Date :</strong> {new Date(a.date).toLocaleString()}
                </span>
                <br />
                <span>
                  <strong>Médecin :</strong> {a.doctor?.name || "Médecin inconnu"}
                </span>
              </div>

              <div className="appointment-actions">
                <span
                  className="status-badge"
                  style={{ backgroundColor: statusColor[a.status] }}
                >
                  {statusLabel[a.status] || a.status}
                </span>

                {(a.status === "confirmed" || a.status === "pending") && (
                  <button
                    className="cancel-btn"
                    onClick={() => cancelAppointment(a._id)}
                  >
                    Annuler
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PatientAppointments;
