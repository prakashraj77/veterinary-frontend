import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCalendar,
  FiActivity,
  FiAlertTriangle,
  FiExternalLink,
} from "react-icons/fi";
import { FaRupeeSign, FaSyringe } from "react-icons/fa";

import { StatCard } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { getAppointments } from "../../services/appointmentService";
import { getPatients } from "../../services/patientService";
import { getPrescriptions } from "../../services/prescriptionService";
import { getDueVaccinations } from "../../services/vaccinationService";
import { getInvoices } from "../../services/billingService";
import "./Dashboard.css";

const STATUS_VARIANT = {
  Completed: "success",
  "In Consultation": "info",
  Waiting: "warning",
  Confirmed: "navy",
  Cancelled: "danger",
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        const [
          appointmentsData,
          patientsData,
          prescriptionsData,
          vaccinationsData,
          invoicesData,
        ] = await Promise.all([
          getAppointments().catch(() => []),
          getPatients().catch(() => []),
          getPrescriptions().catch(() => []),
          getDueVaccinations().catch(() => []),
          getInvoices().catch(() => []),
        ]);

        if (!mounted) return;

        setAppointments(
          Array.isArray(appointmentsData) ? appointmentsData : []
        );
        setPatients(
          Array.isArray(patientsData) ? patientsData : []
        );
        setPrescriptions(
          Array.isArray(prescriptionsData) ? prescriptionsData : []
        );
        setVaccinations(
          Array.isArray(vaccinationsData) ? vaccinationsData : []
        );
        setInvoices(
          Array.isArray(invoicesData) ? invoicesData : []
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="table-card">
        <div className="table-empty">Loading dashboard...</div>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  const todaysAppointments = appointments.filter(
    (appointment) => appointment.appointmentDate === today
  );

  const waitingCount = appointments.filter((appointment) =>
    ["WAITING", "CONFIRMED", "Waiting", "Confirmed"].includes(
      appointment.status
    )
  ).length;

  const inConsultationCount = appointments.filter(
    (appointment) =>
      String(appointment.status || "").toLowerCase() ===
      "in consultation"
  ).length;

  const emergencyCount = appointments.filter(
    (appointment) =>
      String(appointment.appointmentType || "").toLowerCase() ===
      "emergency"
  ).length;

  const revenue = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.paidAmount || 0),
    0
  );

  const pending = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.dueAmount || 0),
    0
  );

  return (
    <div className="dashboard stack-6">
      <div className="stat-grid">
        <StatCard
          icon={FiCalendar}
          label="Today's appointments"
          value={todaysAppointments.length}
          sub={`${appointments.length} total`}
          iconBg="primary"
        />

        <StatCard
          icon={FiActivity}
          label="Waiting / confirmed"
          value={waitingCount}
          sub={`${inConsultationCount} in consult`}
          iconBg="info"
        />

        <StatCard
          icon={FiAlertTriangle}
          label="Emergency cases"
          value={emergencyCount}
          sub="From appointments"
          iconBg="warning"
        />

        <StatCard
          icon={FaRupeeSign}
          label="Collected"
          value={`₹${revenue.toLocaleString("en-IN")}`}
          sub={`₹${pending.toLocaleString("en-IN")} due`}
          iconBg="success"
        />
      </div>

      <div className="dashboard-grid">
        <div className="panel dashboard-schedule">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Today's schedule</h3>
              <p className="panel-subtitle">
                {todaysAppointments.length} appointments
              </p>
            </div>

            <button
              onClick={() => navigate("/appointments")}
              className="panel-link"
            >
              View all <FiExternalLink size={14} />
            </button>
          </div>

          <div className="row-list">
            {todaysAppointments.map((appointment) => (
              <div key={appointment.id} className="row-item">
                <div className="row-time">
                  {appointment.appointmentTime || "—"}
                </div>

                <div className="row-avatar">
                  {appointment.icon || "🐾"}
                </div>

                <div className="row-body">
                  <p className="row-title">
                    {appointment.patientName || "Patient"}
                    {appointment.breed
                      ? ` · ${appointment.breed}`
                      : ""}
                    {appointment.ownerName
                      ? ` · ${appointment.ownerName}`
                      : ""}
                  </p>

                  <p className="row-desc">
                    {appointment.appointmentType || "Visit"}
                    {appointment.reason
                      ? ` · ${appointment.reason}`
                      : ""}
                  </p>
                </div>

                <Badge
                  variant={
                    STATUS_VARIANT[appointment.status] || "slate"
                  }
                >
                  {String(
                    appointment.status || "scheduled"
                  ).toUpperCase()}
                </Badge>
              </div>
            ))}

            {!todaysAppointments.length && (
              <p className="table-empty">No appointments today.</p>
            )}
          </div>
        </div>

       <div className="dashboard-side stack-4">
  <div className="panel">
    <div
      className="panel-header"
      style={{ marginBottom: 8 }}
    >
      <div>
        <h3
          className="panel-title"
          style={{ fontSize: 15 }}
        >
          Vaccinations due
        </h3>

        <p className="panel-subtitle">
          Upcoming vaccinations
        </p>
      </div>

      <FaSyringe className="text-faint" />
    </div>

    <div className="row-list">
      {vaccinations
        .filter((v) => {
          if (!v.nextDueDate) return false;

          const dueDate = new Date(v.nextDueDate);
          const today = new Date();

          today.setHours(0, 0, 0, 0);
          dueDate.setHours(0, 0, 0, 0);

          return dueDate >= today;
        })
        .slice(0, 5)
        .map((vaccination) => (
          <div key={vaccination.id} className="row-item">
            <div className="row-avatar">🐾</div>

            <div className="row-body">
              <p className="row-title">
                {vaccination.patientName || "Patient"}
                {vaccination.vaccineName
                  ? ` · ${vaccination.vaccineName}`
                  : ""}
              </p>

              <p className="row-desc">
                Due {vaccination.nextDueDate || "—"}
              </p>
            </div>
          </div>
        ))}

      {!vaccinations.filter((v) => {
        if (!v.nextDueDate) return false;

        const dueDate = new Date(v.nextDueDate);
        const today = new Date();

        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);

        return dueDate >= today;
      }).length && (
        <p className="table-empty">
          No vaccinations due.
        </p>
      )}
    </div>
  </div>


          <div className="panel">
            <div
              className="panel-header"
              style={{ marginBottom: 8 }}
            >
              <h3
                className="panel-title"
                style={{ fontSize: 15 }}
              >
                Recent patients
              </h3>

              <button
                onClick={() => navigate("/patients")}
                className="panel-link"
              >
                All patients
              </button>
            </div>

            <div className="row-list">
              {patients
                .slice(-5)
                .reverse()
                .map((patient) => (
                  <div key={patient.id} className="row-item">
                    <div className="row-avatar">
                      {patient.icon || "🐾"}
                    </div>

                    <div className="row-body">
                      <p className="row-title">
                        {patient.name || "Patient"}
                      </p>

                      <p className="row-desc">
                        {patient.breed || patient.species || "—"}
                        {patient.weight != null
                          ? ` · ${patient.weight} kg`
                          : ""}
                      </p>
                    </div>
                  </div>
                ))}

              {!patients.length && (
                <p className="table-empty">No patients.</p>
              )}
            </div>
          </div>

          <div className="panel">
            <h3
              className="panel-title"
              style={{ fontSize: 15, marginBottom: 10 }}
            >
              Recent prescriptions
            </h3>

            <div className="row-list">
              {prescriptions
                .slice(-5)
                .reverse()
                .map((prescription) => (
                  <div
                    key={prescription.id}
                    className="row-item"
                    style={{ padding: "8px 0" }}
                  >
                    <div className="row-body">
                      <p className="row-title">
                        #{prescription.id} · {prescription.patientName || "Patient"}
                      </p>

                      <p className="row-desc">
                        {prescription.diagnosis || "Prescription"}
                      </p>
                    </div>

                    <span
                      className="text-faint"
                      style={{ fontSize: 12 }}
                    >
                      {prescription.prescriptionDate || ""}
                    </span>
                  </div>
                ))}

              {!prescriptions.length && (
                <p className="table-empty">No prescriptions.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
