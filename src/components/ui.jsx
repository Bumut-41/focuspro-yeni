import { Link, NavLink } from "react-router-dom";

export function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function Page({ children, className, narrow, wide }) {
  return (
    <div
      className={cn(
        "fp-page",
        narrow && "fp-page--narrow",
        wide && "fp-page--wide",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Card({ children, className, as: Tag = "div", ...rest }) {
  return (
    <Tag className={cn("fp-card", className)} {...rest}>
      {children}
    </Tag>
  );
}

export function CardHeader({ title, description, action }) {
  return (
    <div className="fp-card-header">
      <div>
        {title && <h2 className="fp-card-title">{title}</h2>}
        {description && <p className="fp-card-desc">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Field({ label, children, className, hint }) {
  return (
    <div className={cn("fp-field", className)}>
      {label && <label className="fp-label">{label}</label>}
      {children}
      {hint && <p className="fp-hint">{hint}</p>}
    </div>
  );
}

export function Input(props) {
  return <input className={cn("fp-input", props.className)} {...props} />;
}

export function Select(props) {
  return <select className={cn("fp-input", "fp-select", props.className)} {...props} />;
}

export function Button({
  variant = "primary",
  size,
  className,
  children,
  asLink,
  to,
  type = "button",
  ...rest
}) {
  const cls = cn(
    "fp-btn",
    variant === "primary" && "fp-btn--primary",
    variant === "secondary" && "fp-btn--secondary",
    variant === "ghost" && "fp-btn--ghost",
    variant === "danger" && "fp-btn--danger",
    size === "sm" && "fp-btn--sm",
    className
  );
  if (asLink && to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  );
}

export function Alert({ variant = "info", children, className }) {
  return <div className={cn("fp-alert", `fp-alert--${variant}`, className)}>{children}</div>;
}

export function Badge({ variant = "neutral", children }) {
  return <span className={cn("fp-badge", `fp-badge--${variant}`)}>{children}</span>;
}

export function Stack({ children, direction = "row", gap, className, wrap }) {
  return (
    <div
      className={cn(
        "fp-stack",
        direction === "column" && "fp-stack--col",
        wrap && "fp-stack--wrap",
        className
      )}
      style={gap != null ? { gap } : undefined}
    >
      {children}
    </div>
  );
}

export function DataTable({ columns, rows, rowKey, onRowClick, activeKey }) {
  return (
    <div className="fp-table-wrap">
      <table className="fp-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key || col.label} style={col.width ? { width: col.width } : undefined}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className={cn(onRowClick && "fp-table-row--clickable", activeKey === rowKey(row) && "fp-table-row--active")}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <td key={col.key || col.label}>{col.render ? col.render(row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatCard({ label, value, sub }) {
  return (
    <div className="fp-stat">
      <span className="fp-stat-label">{label}</span>
      <span className="fp-stat-value">{value}</span>
      {sub && <span className="fp-stat-sub">{sub}</span>}
    </div>
  );
}

export function AppNavLink({ to, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => cn("fp-nav-link", isActive && "fp-nav-link--active")}
    >
      {children}
    </NavLink>
  );
}

export function Divider({ label }) {
  return (
    <div className="fp-divider" role="separator">
      {label && <span>{label}</span>}
    </div>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="fp-empty">
      <p className="fp-empty-title">{title}</p>
      {description && <p className="fp-empty-desc">{description}</p>}
    </div>
  );
}

/** @deprecated Use className="fp-input" — kept for gradual migration */
export const input = "fp-input";
export const card = "fp-card";
export const btnPrimary = "fp-btn fp-btn--primary";
export const btnGhost = "fp-btn fp-btn--secondary";
