const LOGO_SRC = "/focuspro-logo.png";

/** Focus Pro Lab marka logosu */
export function BrandLogo({ variant = "header", className = "" }) {
  return (
    <img
      src={LOGO_SRC}
      alt="Focus Pro Lab"
      className={`fp-brand-logo fp-brand-logo--${variant}${className ? ` ${className}` : ""}`}
      width={variant === "header" ? 280 : variant === "auth" ? 260 : 200}
      height={variant === "header" ? 76 : variant === "auth" ? 120 : 56}
      decoding="async"
    />
  );
}
