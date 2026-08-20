import { Routes, Route } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import Dashboard from "../pages/Dashboard/Dashboard";
import AppointmentPage from "../pages/Appointments/AppointmentPage";
import Patients from "../pages/Patients/Patients";
import PatientProfile from "../pages/Patients/PatientProfile";
import Prescription from "../pages/Prescription/Prescription";
import Followup from "../pages/Followups/Followup";
import Inventory from "../pages/Inventory/Inventory";
import Billing from "../pages/Billing/Billing";
import DoctorProfile from "../pages/Settings/DoctorProfile";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/appointments" element={<AppointmentPage />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/patients/:id" element={<PatientProfile />} />
        <Route path="/prescriptions" element={<Prescription />} />
        <Route path="/followups" element={<Followup />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/settings" element={<DoctorProfile />} />
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
