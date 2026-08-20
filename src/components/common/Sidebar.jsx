import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiSettings, FiLogOut } from "react-icons/fi";

import sidebarItems from "../../constants/sidebar";
import Logo from "./Logo";
import { useAuth } from "../../hooks/useAuth";

import {
  getDoctorProfile,
} from "../../services/doctorProfileService";

import "./Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [doctor, setDoctor] = useState(null);

  // ==========================================
  // LOAD DOCTOR PROFILE
  // ==========================================

  const loadDoctorProfile = async () => {
    try {
      const data = await getDoctorProfile();

      console.log(
        "Sidebar doctor profile:",
        data
      );

      setDoctor(data || null);
    } catch (error) {
      console.error(
        "Failed to load doctor profile in sidebar:",
        error
      );
    }
  };

  // ==========================================
  // INITIAL LOAD + PROFILE UPDATE
  // ==========================================

  useEffect(() => {
    loadDoctorProfile();

    const handleDoctorProfileUpdated = () => {
      loadDoctorProfile();
    };

    window.addEventListener(
      "doctorProfileUpdated",
      handleDoctorProfileUpdated
    );

    return () => {
      window.removeEventListener(
        "doctorProfileUpdated",
        handleDoctorProfileUpdated
      );
    };
  }, []);

  // ==========================================
  // DOCTOR NAME
  // ==========================================

  const doctorName =
    doctor?.fullName?.trim() ||
    "Veterinary Doctor";

  const clinicName =
    doctor?.clinicHospital?.trim() ||
    "Zenve Veterinary";

  // ==========================================
  // DOCTOR INITIALS
  // ==========================================

  const getInitials = (name) => {
    if (!name) {
      return "DV";
    }

    const words = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (words.length === 1) {
      return words[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      words[0].charAt(0) +
      words[words.length - 1].charAt(0)
    ).toUpperCase();
  };

  const doctorInitials =
    getInitials(doctorName);

  // ==========================================
  // SIDEBAR
  // ==========================================

  return (
    <aside className="sidebar">

      {/* LOGO */}

      <div className="logo-section">
        <Logo />
      </div>

      {/* WORKSPACE */}

      <p className="workspace">
        WORKSPACE
      </p>

      {/* MENU */}

      <nav className="menu-list">

        {sidebarItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.title}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                isActive
                  ? "menu active"
                  : "menu"
              }
            >
              <Icon size={20} />

              <span>
                {item.title}
              </span>
            </NavLink>
          );
        })}

      </nav>

      {/* DOCTOR PROFILE CARD */}

      <button
        type="button"
        className="doctor-card"
        onClick={() =>
          navigate("/settings")
        }
        title="Open doctor profile"
      >

        <div className="doctor-avatar">
          {doctorInitials}
        </div>

        <div className="doctor-info">

          <h4>
            {doctorName}
          </h4>

          <p>
            {clinicName}
          </p>

        </div>

        <FiSettings size={18} />

      </button>

      {/* LOGOUT */}

      <button
        type="button"
        className="logout-btn"
        onClick={() => {
          logout();
          navigate("/login");
        }}
        title="Log out"
      >
        <FiLogOut size={16} />
        <span>Log out</span>
      </button>

    </aside>
  );
}