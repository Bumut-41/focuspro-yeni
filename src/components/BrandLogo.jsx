const LOGO_SRC = "/focuspro-logo.png";

/** Focus Pro Lab marka logosu */
export function BrandLogo({ variant = "header", className = "" }) {
  return (
    <img
      src={LOGO_SRC}
      alt="Focus Pro Lab"
      className={`fp-brand-logo fp-brand-logo--${variant}${className ? ` ${className}` : ""}`}
      width={variant === "header" ? 180 : variant === "auth" ? 260 : 200}
      height={variant === "header" ? 44 : variant === "auth" ? 120 : 56}
      decoding="async"
    />
  );
}
