import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FiPlus } from "react-icons/fi";

import Button from "../ui/Button";
import NotificationBell from "./NotificationBell";
import GlobalSearch from "./GlobalSearch";
import NewVisitModal from "../modals/NewVisitModal";

import { PAGE_META } from "../../constants/pageMeta";

import { getPatients } from "../../services/patientService";
import { getDoctorProfile } from "../../services/doctorProfileService";

import "./Navbar.css";

function greeting() {
  const h = new Date().getHours();

  if (h < 12) {
    return "Good Morning";
  }

  if (h < 17) {
    return "Good Afternoon";
  }

  return "Good Evening";
}

export default function Navbar() {
  const { pathname } = useLocation();

  const [newVisitOpen, setNewVisitOpen] =
    useState(false);

  const [patientCount, setPatientCount] =
    useState(0);

  const [doctor, setDoctor] =
    useState(null);

  const [doctorLoading, setDoctorLoading] =
    useState(true);

  const isDashboard = pathname === "/";

  const meta = PAGE_META[pathname];

  // =====================================================
  // LOAD DOCTOR PROFILE
  // =====================================================

  const loadDoctorProfile = async () => {
    try {
      setDoctorLoading(true);

      const data =
        await getDoctorProfile();

      console.log(
        "Navbar - doctor profile:",
        data
      );

      setDoctor(data || null);
    } catch (error) {
      console.error(
        "Navbar - failed to load doctor profile:",
        error
      );

      setDoctor(null);
    } finally {
      setDoctorLoading(false);
    }
  };

  // =====================================================
  // LOAD DOCTOR ON START
  // AND WHEN PROFILE IS UPDATED
  // =====================================================

  useEffect(() => {
    loadDoctorProfile();

    const handleDoctorProfileUpdated = () => {
      console.log(
        "Navbar - doctor profile update detected"
      );

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

  // =====================================================
  // LOAD PATIENT COUNT
  // =====================================================

  useEffect(() => {
    if (pathname !== "/patients") {
      return;
    }

    const loadPatients = async () => {
      try {
        const data =
          await getPatients();

        setPatientCount(
          Array.isArray(data)
            ? data.length
            : 0
        );
      } catch (error) {
        console.error(
          "Navbar - failed to load patients:",
          error
        );

        setPatientCount(0);
      }
    };

    loadPatients();

    const refreshPatients = () => {
      loadPatients();
    };

    window.addEventListener(
      "patientsUpdated",
      refreshPatients
    );

    return () => {
      window.removeEventListener(
        "patientsUpdated",
        refreshPatients
      );
    };
  }, [pathname]);

  // =====================================================
  // DOCTOR NAME
  // =====================================================

  const doctorName =
    doctor?.fullName?.trim() ||
    "Veterinary Doctor";

  // =====================================================
  // CLINIC NAME
  // =====================================================

  const clinicName =
    doctor?.clinicHospital?.trim() ||
    "Zenve Veterinary";

  // =====================================================
  // NAVBAR TITLE
  // =====================================================

  const title = isDashboard
    ? `${greeting()}, ${doctorName}`
    : meta?.title ||
      "Patients Profile";

  // =====================================================
  // NAVBAR SUBTITLE
  // =====================================================

  const subtitle = isDashboard
    ? clinicName
    : pathname === "/patients"
      ? `${patientCount} registered ${
          patientCount === 1
            ? "pet"
            : "pets"
        } across species`
      : meta?.subtitle || "";

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      <header className="navbar">

        {/* ========================================= */}
        {/* LEFT SIDE                                */}
        {/* ========================================= */}

        <div className="navbar-left">

          <h1 className="navbar-title">
            {title}
          </h1>

          {subtitle && (
            <p className="navbar-subtitle">
              {subtitle}
            </p>
          )}

        </div>

        {/* ========================================= */}
        {/* RIGHT SIDE                               */}
        {/* ========================================= */}

        <div className="navbar-right">

          {/* SEARCH */}

          <div className="navbar-search">
            <GlobalSearch />
          </div>

          {/* NOTIFICATIONS */}

          <NotificationBell />

          {/* NEW VISIT */}

          <Button
            icon={FiPlus}
            size="lg"
            onClick={() =>
              setNewVisitOpen(true)
            }
          >
            New Visit
          </Button>

        </div>

      </header>

      {/* =========================================== */}
      {/* NEW VISIT MODAL                            */}
      {/* =========================================== */}

      <NewVisitModal
        open={newVisitOpen}
        onClose={() =>
          setNewVisitOpen(false)
        }
      />
    </>
  );
}