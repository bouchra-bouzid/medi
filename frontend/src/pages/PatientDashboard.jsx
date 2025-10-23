import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import PatientAppointments from "../components/PatientAppointments";
import AvailableSlots from "../components/AvailableSlots";
import ChatBox from "../components/ChatBox";
import "./Dashboard.css";

const PatientDashboard = () => {
  const { user, setUser } = useContext(AuthContext);
  const [profile, setProfile] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeDoctors, setActiveDoctors] = useState([]);

// 🔹 Récupère les médecins avec lesquels le patient a déjà échangé
const fetchActiveDoctors = async () => {
  if (!user?._id) return;
  try {
    const res = await API.get(`/messages/doctors/active/${user._id}`);
    setActiveDoctors(res.data || []);
  } catch (err) {
    console.error("Erreur fetchActiveDoctors:", err);
  }
};




  // 🔹 Fetch profil patient
  const fetchProfile = async () => {
  if (!user?._id) return;
  try {
    setLoadingProfile(true);
    const res = await API.get(`/patients/${user._id}`);
    setProfile(res.data || {});
    setUser(res.data || {});
  } catch (err) {
    console.error("Erreur fetchProfile:", err);
  } finally {
    setLoadingProfile(false);
  }
};


  // 🔹 Fetch tous les médecins
  const fetchDoctors = async () => {
    try {
      const res = await API.get("/doctors");
      setDoctors(res.data || []);
    } catch (err) {
      console.error("Erreur fetchDoctors:", err);
    }
  };

  // 🔹 Fetch messages non lus
  const fetchUnread = async () => {
  if (!user?._id) return;
  try {
    // Appel à ta route backend
    const res = await API.get(`/messages/doctors/unread/${user._id}`);
    const unreadData = res.data || [];

    // 🔹 Crée un objet { doctorId: nombre_de_messages_non_lus }
    const unreadMap = {};
    unreadData.forEach(item => {
      unreadMap[item.doctorId] = item.count;
    });

    // 🔹 Mets à jour chaque médecin dans activeDoctors avec le bon nombre
    setActiveDoctors(prev =>
      prev.map(doc => ({
        ...doc,
        unreadCount: unreadMap[doc._id] || 0,
      }))
    );

    // 🔹 Optionnel : total global
    const totalUnread = unreadData.reduce((sum, item) => sum + item.count, 0);
    setUnreadCount(totalUnread);

  } catch (err) {
    console.error("Erreur fetchUnread:", err);
  }
};



 useEffect(() => {
  fetchProfile();
  fetchDoctors();
  fetchActiveDoctors();
}, [refresh]);


  useEffect(() => {
    const interval = setInterval(fetchUnread, 4000);
    return () => clearInterval(interval);
  }, [user]);

  if (loadingProfile) return <p>Chargement du profil...</p>;
  if (!user) return <p>Chargement...</p>;

  return (
    <div className="dashboard-container">
      <div className="main-section">
        {/* Mes rendez-vous */}
        <div className="card">
          <h3>Mes Rendez-vous</h3>
          <PatientAppointments refresh={refresh} />
        </div>

        

       {/* Messagerie */}
<div className="card chat-section">
  <h3>Messagerie</h3>

  {/* ✅ Sélecteur pour choisir un nouveau médecin */}
  <div className="chat-selector">
    <select
      value={selectedDoctor?._id || ""}
      onChange={(e) => {
        const doc = doctors.find((d) => d._id === e.target.value);
        setSelectedDoctor(doc || null);
        if (doc) setIsChatOpen(true);
      }}
    >
      <option value="">-- Choisir un médecin --</option>
      {doctors.map((d) => (
        <option key={d._id} value={d._id}>
          {d.name || "Médecin"}
        </option>
      ))}
    </select>
  </div>

  <div className="chat-body">
    {/* ✅ Liste des médecins avec messages échangés */}
    <div className="chat-sidebar">
      {activeDoctors?.length > 0 ? (
        activeDoctors.map((doctor) => (
          <div
            key={doctor._id}
            className={`chat-user-item ${
              selectedDoctor?._id === doctor._id ? "active" : ""
            }`}
            onClick={() => {
              setSelectedDoctor(doctor);
              setIsChatOpen(true);

              // 🔹 Marquer les messages comme lus
              API.put(`/messages/mark-read/${doctor._id}/${user._id}`)
                .then(() => fetchUnread())
                .catch((err) => console.error("Erreur lecture:", err));
            }}
          >
            <div className="chat-user-avatar">
              <FaUserCircle size={28} />
            </div>
            <div className="chat-user-info">
              <span className="chat-user-name">{doctor.name}</span>
              <span className="chat-user-status online"></span>
            </div>

            {doctor.unreadCount ? (
  <span className="chat-unread-badge">{doctor.unreadCount}</span>
) : null}

          </div>
        ))
      ) : (
        <p className="no-chat">Aucune discussion</p>
      )}
    </div>

    {/* ✅ Fenêtre de chat */}
    <ChatBox
      currentUser={user}
      receiver={selectedDoctor}
      isOpen={isChatOpen && !!selectedDoctor}
      onClose={() => setIsChatOpen(false)}
      onMessageSent={(newDoctor) => {
        // 🔹 Si nouveau médecin, on l’ajoute à la liste
        if (newDoctor && !activeDoctors.some((d) => d._id === newDoctor._id)) {
          setActiveDoctors((prev) => [...prev, newDoctor]);
        }
      }}
    />
  </div>
</div>

      </div>

      {/* Profil */}
      <div className="profile-card">
        <h3>Profil Patient</h3>
        <div className="profile-img">
          {profile?.profilePic ? (
            <img
              src={profile.profilePic.startsWith("http")
                ? profile.profilePic
                : `http://localhost:5000/uploads/${profile.profilePic}`}
              alt="profil"
              style={{ width: 100, borderRadius: "50%" }}
            />
          ) : (
            <FaUserCircle size={80} color="#0d6efd" />
          )}
        </div>
        <p><strong>Nom :</strong> {profile?.name || "—"}</p>
        <p><strong>Email :</strong> {profile?.email || "—"}</p>
        <p><strong>Âge :</strong> {profile?.age || "Non défini"}</p>
        <p><strong>Sexe :</strong> {profile?.sexe || "Non défini"}</p>
        <p><strong>Téléphone :</strong> {profile?.phone || "Non défini"}</p>
        <p><strong>Adresse :</strong> {profile?.address || "Non défini"}</p>

        <Link to="/patient/profile">
          <button className="profile-btn">Mettre à jour mon profil</button>
        </Link>
      </div>
    </div>
  );
};

export default PatientDashboard;
