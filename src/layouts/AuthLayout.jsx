import { FaPaw, FaRegCalendarCheck, FaFileMedical, FaBoxes } from "react-icons/fa";

import "../pages/Auth/Auth.css";

export default function AuthLayout({ children }) {
  return (
    <div className="auth-shell">
      {/* -------------------- BRAND PANEL -------------------- */}

      <div className="auth-brand">
        <div className="auth-brand-top">
          <div className="auth-brand-logo-icon">
            <FaPaw size={20} />
          </div>

          <div className="auth-brand-logo-text">
            <h3>VetiCare</h3>
            <span>Veterinary Doctor Portal</span>
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
          &copy; {new Date().getFullYear()} VetiCare. All rights reserved.
        </div>
      </div>

      {/* -------------------- FORM PANEL -------------------- */}

      <div className="auth-form-panel">
        <div className="auth-form-wrap">{children}</div>
      </div>
    </div>
  );
}
