import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import DoctorSlotForm from "../components/DoctorSlotForm";
import AvailableSlots from "../components/AvailableSlots";
import ChatBox from "../components/ChatBox";
import CustomSlotForm from "../components/CustomSlotForm";

import "./Dashboard.css";

const DoctorDashboard = () => {
  const { user, setUser } = useContext(AuthContext);
  const [profile, setProfile] = useState({});
  const [refresh, setRefresh] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activePatient, setActivePatient] = useState(null);
const [activePatients, setActivePatients] = useState([]); // tous les patients avec messages non lus
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [showAvailableSlots, setShowAvailableSlots] = useState(false);
  const [appointments, setAppointments] = useState([]);
const [slots, setSlots] = useState([]);


const fetchSlots = async () => {
  try {
    const res = await API.get(`/appointments/mine`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setSlots(res.data || []);
  } catch (err) {
    console.error("Erreur fetch slots:", err);
  }
};


  const fetchProfile = async () => {
  if (!user?._id) return;
  console.log("Fetching profile pour doctorId:", user._id); // 🔹
  try {
    const res = await API.get(`/doctors/${user._id}`);
    console.log("Profile reçu:", res.data); // 🔹
    setProfile(res.data);
    setUser(res.data);
  } catch (err) {
    console.error("Erreur fetchProfile:", err); // 🔹
  }
};


const fetchActivePatients = async () => {
  if (!user?._id) return;
  try {
    const res = await API.get(`/messages/patients/active/${user._id}`);
    setActivePatients(res.data || []);
  } catch (err) {
    console.error("Erreur fetchActivePatients:", err);
  }
};



const fetchUnread = async () => {
  if (!user?._id) {
    console.log("user._id non défini, impossible de fetchUnread"); // 🔹
    return;
  }
  console.log("Fetching unread appointments pour doctorId:", user._id); // 🔹
  try {
    const res = await API.get(`/appointments/unread/${user._id}`);
    console.log("Unread data reçu:", res.data); // 🔹
    setUnreadCount(res.data.count || 0);
  } catch (err) {
    console.error("Erreur fetchUnread:", err); // 🔹
    if (err.response) {
      console.error("Status code:", err.response.status); // 🔹
      console.error("Data:", err.response.data); // 🔹
    }
  }
};

useEffect(() => {
  fetchProfile();
  fetchUnread();
  fetchActivePatients();
}, [refresh]);

useEffect(() => {
  if (!selectedPatient && activePatients.length > 0) {
    setSelectedPatient(activePatients[0]);
  }
}, [activePatients]);


useEffect(() => {
  const fetchAppointments = async () => {
    try {
      const res = await API.get(`/appointments/doctor/${user._id}`);
      setAppointments(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des rendez-vous :", err);
    }
  };
  fetchAppointments();
}, [user]);
 // tu peux déclencher un refresh si besoin

 

  useEffect(() => {
  const fetchAppointments = async () => {
    try {
      const res = await API.get(`/appointments/doctor/${user._id}`);
      setAppointments(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des rendez-vous :", err);
    }
  };
  fetchAppointments();
}, [user]);

  useEffect(() => {
    const interval = setInterval(fetchUnread, 4000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) return <p>Chargement...</p>;

  return (
    <div className="dashboard-container">
      <div className="main-section">
        {/* Créneaux */}
        <div className="card">
          <h3>Mes Créneaux</h3>
          <DoctorSlotForm onCreated={() => setRefresh(!refresh)} />

          {/* Bouton pour créneau personnalisé */}
          <button
            className="toggle-custom-slot-btn"
            onClick={() => setShowCustomForm(!showCustomForm)}
          >
            {showCustomForm ? "Fermer le créneau personnalisé" : "Créer un créneau personnalisé"}
          </button>

          {/* Bouton pour voir les créneaux libres */}
          <button
            className="show-slots-btn"
            onClick={() => setShowAvailableSlots(!showAvailableSlots)}
            
          >
            {showAvailableSlots ? "Masquer les créneaux libres" : "Voir les créneaux libres"}
          </button>

          {/* Formulaire custom */}
          {showCustomForm && (
            <CustomSlotForm onCreated={() => {
              setRefresh(!refresh);
              setShowCustomForm(false);
            }} />
          )}

          {/* Affichage des créneaux libres */}
          {showAvailableSlots && (
  <div >
    <AvailableSlots doctorId={user._id} forPatient={false} />
  </div>
)}

</div>

        

    {/* Messagerie */}
        
  {/* Messagerie */}
<div className="card chat-section">
  <h3>Messagerie</h3>

  <div className="chat-sidebar">
    {activePatients.length > 0 ? (
      activePatients.map((patient) => (
        <div
          key={patient._id}
          className={`chat-user-item ${
            selectedPatient?._id === patient._id ? "active" : ""
          }`}
          onClick={() => {
            setSelectedPatient(patient);
            setIsChatOpen(true);

            // 🔹 Marquer les messages comme lus quand on ouvre la conversation
            API.put(`/messages/mark-read/${user._id}/${patient._id}`)
              .then(() => fetchActivePatients())
              .catch((err) => console.error("Erreur lecture:", err));
          }}
        >
          <div className="chat-user-avatar">
            <FaUserCircle size={28} />
          </div>
          <div className="chat-user-info">
            <span className="chat-user-name">{patient.name}</span>
            <span className="chat-user-status online"></span>
          </div>
            {patient.unreadCount ? (
  <span className="chat-unread-badge">{patient.unreadCount}</span>
) : null}



        </div>
      ))
    ) : (
      <p className="no-chat">Aucune discussion</p>
    )}
  </div>

  {/* Fenêtre de chat */}
  <ChatBox
    currentUser={user}
    receiver={selectedPatient}
    isOpen={isChatOpen && !!selectedPatient}
    onClose={() => setIsChatOpen(false)}
  />
</div>

  
  
  </div>

      {/* Profil */}
      <div className="profile-card">
        <h3>Profil Médecin</h3>
        <div className="profile-img">
          {profile.profilePic ? (
            <img
              src={profile.profilePic.startsWith("http") ? profile.profilePic : `http://localhost:5000/uploads/${profile.profilePic}`}
              alt="profil"
              style={{ width: 100, borderRadius: "50%" }}
            />
          ) : (
            <FaUserCircle size={80} color="#0d6efd" />
          )}
        </div>
        <p><strong>Nom :</strong> {profile.name}</p>
        <p><strong>Email :</strong> {profile.email}</p>
        <p><strong>Spécialité :</strong> {profile.specialty || "—"}</p>
        <p><strong>Bio :</strong> {profile.bio || "—"}</p>
        <p><strong>Expérience :</strong> {profile.experience || "—"}</p>
        <p><strong>Téléphone :</strong> {profile.phone || "—"}</p>
        <p><strong>Adresse :</strong> {profile.address || "—"}</p>
        <Link to="/doctor/profile">
          <button className="profile-btn">Mettre à jour mon profil</button>
        </Link>
      </div>
    </div>
  );
};

export default DoctorDashboard;
