import clsx from "clsx";

const VARIANTS = {
  primary: "btn-primary",
  teal: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
};

const SIZES = {
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  icon: Icon,
  children,
  ...props
}) {
  return (
    <button
      className={clsx("btn", SIZES[size], VARIANTS[variant], className)}
      {...props}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
}
