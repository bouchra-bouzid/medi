import { useState, useEffect, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./profile.css";

const PatientProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    age: "",
    sexe: "",
    phone: "",
    address: "",
    profilePic: "", // comme pour doctor
  });

  // 🔹 Charger le profil au montage
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get(`/patients/${user._id}`);
        setForm({
          ...res.data,
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } catch (err) {
        console.error("Erreur chargement profil patient :", err);
      }
    };
    fetchProfile();
  }, [user._id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      const updateData = {
        name: form.name,
        email: form.email,
        age: form.age,
        sexe: form.sexe,
        phone: form.phone,
        address: form.address,
        profilePic: form.profilePic,
        oldPassword: form.oldPassword || undefined,
        newPassword: form.newPassword || undefined,
      };

      const res = await API.put(`/patients/${user._id}`, updateData);
      setUser(res.data.user); // mettre à jour le contexte global
      alert("Profil mis à jour !");
      navigate("/patient");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour");
    }
  };

  return (
    <div className="profile-container">
      <h2>Profil Patient</h2>
      <form onSubmit={handleSubmit}>
        <label>Nom</label>
        <input name="name" value={form.name} onChange={handleChange} />

        <label>Email</label>
        <input name="email" value={form.email} onChange={handleChange} type="email" />

        <label>Photo de profil (URL)</label>
        <input name="profilePic" value={form.profilePic} onChange={handleChange} />
        

        <label>Âge</label>
        <input name="age" value={form.age} onChange={handleChange} />

        <label>Sexe</label>
        <select name="sexe" value={form.sexe} onChange={handleChange}>
          <option value="">-- Sélectionner --</option>
          <option value="Homme">Homme</option>
          <option value="Femme">Femme</option>
        </select>

        <label>Téléphone</label>
        <input name="phone" value={form.phone} onChange={handleChange} />

        <label>Adresse</label>
        <input name="address" value={form.address} onChange={handleChange} />

        <hr />
        <h4>Changer le mot de passe</h4>
        <input type="password" name="oldPassword" value={form.oldPassword} onChange={handleChange} placeholder="Ancien mot de passe" />
        <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} placeholder="Nouveau mot de passe" />
        <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Confirmer mot de passe" />

        <button type="submit">Mettre à jour</button>
      </form>
    </div>
  );
};

export default PatientProfile;
