import { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { format, parseISO } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import API from "../services/api";

const localizer = momentLocalizer(require("moment"));

const AppointmentsCalendar = ({ doctorId }) => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayAppointments, setDayAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await API.get(`/appointments/doctor/${doctorId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const calendarEvents = res.data.map((a) => ({
          id: a._id,
          title: a.patient?.name || "Rendez-vous",
          start: new Date(a.date),
          end: new Date(a.date),
          status: a.status,
          raw: a,
        }));

        setEvents(calendarEvents);
      } catch (err) {
        console.error("Erreur fetch appointments:", err);
      }
    };
    fetchAppointments();
  }, [doctorId]);

  const handleSelectSlot = (slotInfo) => {
    const dateStr = format(slotInfo.start, "yyyy-MM-dd");
    setSelectedDate(dateStr);
    const appointmentsForDay = events.filter(
      (e) => format(e.start, "yyyy-MM-dd") === dateStr
    );
    setDayAppointments(appointmentsForDay);
  };

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectSlot}
      />

      {selectedDate && (
        <div style={{ marginTop: "20px" }}>
          <h3>Rendez-vous du {selectedDate}</h3>
          {dayAppointments.length === 0 ? (
            <p>Aucun rendez-vous ce jour.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Heure</th>
                  <th>Patient</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dayAppointments.map((a) => (
                  <tr key={a.id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td>{format(a.start, "HH:mm")}</td>
                    <td>{a.raw.patient?.name}</td>
                    <td>{a.status}</td>
                    <td>
                      {/* Ici tu peux ajouter boutons confirmer / annuler / compléter */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentsCalendar;
