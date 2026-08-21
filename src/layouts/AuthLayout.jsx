import {
  FaRegCalendarCheck,
  FaFileMedical,
  FaBoxes,
} from "react-icons/fa";

import "../pages/Auth/Auth.css";

export default function AuthLayout({ children }) {
  return (
    <div className="auth-shell">

      {/* -------------------- BRAND PANEL -------------------- */}

      <div className="auth-brand">

        <div className="auth-brand-top">

          {/* Zenve Logo */}
          <div className="auth-brand-logo-icon">
            <img
              src="/zenve.png"
              alt="Zenve Logo"
              className="auth-zenve-logo"
            />
          </div>

          <div className="auth-brand-logo-text">
            <h3>Zenve Doctors</h3>
            <span>Veterinary Practice OS</span>
          </div>

        </div>

        <div className="auth-brand-mid">

          <h1>Run your clinic from one simple dashboard.</h1>

          <p>
            Manage appointments, patients, prescriptions, inventory and
            billing in one place, built for busy veterinary practices.
          </p>

          <div className="auth-brand-features">

            <div className="auth-brand-feature">
              <span className="auth-brand-feature-icon">
                <FaRegCalendarCheck size={14} />
              </span>
              Smart appointment scheduling
            </div>

            <div className="auth-brand-feature">
              <span className="auth-brand-feature-icon">
                <FaFileMedical size={14} />
              </span>
              Digital prescriptions & records
            </div>

            <div className="auth-brand-feature">
              <span className="auth-brand-feature-icon">
                <FaBoxes size={14} />
              </span>
              Inventory & billing, handled
            </div>

          </div>
        </div>

        <div className="auth-brand-bottom">
          &copy; {new Date().getFullYear()} Zenve PetCare. All rights reserved.
        </div>

      </div>

      {/* -------------------- FORM PANEL -------------------- */}

      <div className="auth-form-panel">
        <div className="auth-form-wrap">
          {children}
        </div>
      </div>

    </div>
  );
}