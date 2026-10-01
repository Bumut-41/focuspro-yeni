const LOGO_SRC = "/focuspro-logo.png";

/** Focus Pro Lab marka logosu */
export function BrandLogo({ variant = "header", className = "" }) {
  return (
    <img
      src={LOGO_SRC}
      alt="Focus Pro Lab"
      className={`fp-brand-logo fp-brand-logo--${variant}${className ? ` ${className}` : ""}`}
      width={variant === "header" ? 150 : variant === "auth" ? 240 : 180}
      height={variant === "header" ? 92 : variant === "auth" ? 148 : 111}
      decoding="async"
    />
  );
}
