import { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import AvailableSlots from "../components/AvailableSlots"; // ✅ Import ajouté ici
import "./DoctorList.css";

const DoctorsList = () => {
  const { user } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // 🩵 AJOUT MINIMAL POUR CORRIGER L'ERREUR :
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchDoctors = async () => {
      try {
        const res = await API.get("/doctors");
        setDoctors(res.data);
      } catch (err) {
        console.error("Erreur lors du chargement des médecins :", err);
      }
    };
    fetchDoctors();
  }, [user]);

  const handleViewProfile = async (doctorId) => {
    try {
      const resDoctor = await API.get(`/doctors/${doctorId}`);
      setSelectedDoctor(resDoctor.data);
    } catch (err) {
      console.error("Erreur lors du chargement du profil :", err);
    }
  };

  const handleCloseModal = () => {
    setSelectedDoctor(null);
  };

  if (!user) return null;

  return (
    <div className="doctors-container">
      <h2 className="doctors-title"> Liste des Médecins</h2>
      {doctors.length === 0 ? (
        <p className="empty-message">Aucun médecin n’a encore été ajouté.</p>
      ) : (
        <div className="doctors-grid">
          {doctors.map((doc) => (
            <div key={doc._id} className="doctor-card">
              <img
                src={
                  doc.profilePic ||
                  "https://cdn-icons-png.flaticon.com/512/387/387561.png"
                }
                alt={doc.name}
                className="doctor-avatar"
              />
              <h3 className="doctor-name">{doc.name}</h3>
              <p className="doctor-specialty">
                {doc.specialty || "Spécialité non définie"}
              </p>
              <button
  className="doctor-btn"
  onClick={() => handleViewProfile(doc._id)}
>
  {user.role === "patient" ? "Voir le profil et les créneaux" : "Voir le profil"}
</button>

            </div>
          ))}
        </div>
      )}

      {/* 🔹 Modal Profil Médecin */}
      {selectedDoctor && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>
              &times;
            </button>
            <h2>{selectedDoctor.name}</h2>
            <p>
              <strong>Spécialité :</strong>{" "}
              {selectedDoctor.specialty || "Non définie"}
            </p>
            <p>
              <strong>Bio :</strong> {selectedDoctor.bio || "Pas de bio"}
            </p>
            {selectedDoctor.experience && (
              <p>
                <strong>Expérience :</strong> {selectedDoctor.experience}
              </p>
            )}
            <p>
              <strong>Téléphone :</strong>{" "}
              {selectedDoctor.phone || "Non renseigné"}
            </p>
            <p>
              <strong>Adresse :</strong>{" "}
              {selectedDoctor.address || "Adresse non renseignée"}
            </p>

            {/* 🔹 Créneaux disponibles (patients uniquement) */}
            {user.role === "patient" && (
              <>
                <h3>Créneaux disponibles</h3>
                 <AvailableSlots doctorId={selectedDoctor._id} forPatient={true} onBooked={() => setRefresh(!refresh)} />

              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsList;
