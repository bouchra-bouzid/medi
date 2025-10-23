import { useState } from "react";
import DoctorAppointments from "../components/DoctorAppointments";
import "./DoctorAppointmentsPage.css";

const DoctorAppointmentsPage = () => {
  const [refresh, setRefresh] = useState(false);

  return (
    <div className="appointments-page">
      <h2>Mes Rendez-vous</h2>


      <DoctorAppointments
        refresh={refresh}
        onStatusChange={() => setRefresh(!refresh)}
      />
    </div>
  );
};

export default DoctorAppointmentsPage;
