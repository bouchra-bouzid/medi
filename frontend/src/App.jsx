import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientProfile from "./components/PatientProfile";
import DoctorProfile from "./components/DoctorProfile";
import DoctorList from "./components/DoctorList"; // ⚠️ Tu avais oublié cette importationimport 
import DoctorAppointmentsPage from "./pages/DoctorAppointmentsPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/patient/profile" element={<PatientProfile />} />
        <Route path="/doctor/profile" element={<DoctorProfile />} />
        
        <Route path="/doctors" element={<DoctorList />} /> {/* ✅ Corrigé */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/about" element={<About />} />
        <Route path="/doctor/appointments" element={<DoctorAppointmentsPage />} />

      </Routes>
    </Router>
  );
}

export default App;
