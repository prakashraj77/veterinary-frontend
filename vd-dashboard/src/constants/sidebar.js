import {
  FiGrid,
  FiCalendar,
  FiUsers,
  FiFileText,
  FiBell,
  FiPackage,
  FiDollarSign,
} from "react-icons/fi";

const sidebarItems = [
  { title: "Dashboard", path: "/", icon: FiGrid },
  { title: "Appointments", path: "/appointments", icon: FiCalendar },
  { title: "Patients", path: "/patients", icon: FiUsers },
  { title: "Prescriptions", path: "/prescriptions", icon: FiFileText },
  { title: "Follow-ups", path: "/followups", icon: FiBell },
  { title: "Inventory", path: "/inventory", icon: FiPackage },
  { title: "Billing", path: "/billing", icon: FiDollarSign },
];

export default sidebarItems;
