import clsx from "clsx";

const TONE_MAP = {
  teal: "tone-primary",
  sky: "tone-info",
  amber: "tone-warning",
  emerald: "tone-success",
  primary: "tone-primary",
  info: "tone-info",
  warning: "tone-warning",
  success: "tone-success",
  danger: "tone-danger",
};

const SUB_TONE_MAP = {
  "text-emerald-500": "up",
  "text-amber-500": "warn",
  "text-red-500": "danger",
};

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  subColor,
  iconBg = "teal",
}) {
  const tone = TONE_MAP[iconBg] || "tone-primary";
  const subTone = SUB_TONE_MAP[subColor] || "";

  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-card-label">{label}</span>

        {Icon && (
          <div className={clsx("icon-tile", tone)}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <h2 className="stat-card-value">{value}</h2>

      {sub && <p className={clsx("stat-card-sub", subTone)}>{sub}</p>}
    </div>
  );
}

export default function Card({ className = "", children, ...props }) {
  return (
    <div className={clsx("card", className)} {...props}>
      {children}
    </div>
  );
}
