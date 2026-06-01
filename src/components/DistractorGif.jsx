import { MOVING_GIF_KEYS } from "../constants.js";

/**
 * araba, kedi, koşan: sol taraftan başlarsa sağa, sağdan başlarsa sola kayar.
 * Diğer gifler eskisi gibi sabit köşede durur.
 */
export function DistractorGif({ item, onError }) {
  const base = {
    position: "absolute",
    width: item.size,
    maxWidth: "32%",
    pointerEvents: "none"
  };

  if (!MOVING_GIF_KEYS.has(item.gifKey)) {
    return (
      <img
        src={item.gif}
        alt=""
        onError={onError}
        style={{
          ...base,
          left: `${item.left}%`,
          top: `${item.top}%`,
          transform: "translate(-50%, -50%)"
        }}
      />
    );
  }

  const toRight = item.area === "left";

  return (
    <img
      src={item.gif}
      alt=""
      onError={onError}
      className={toRight ? "distractor-gif-move-ltr" : "distractor-gif-move-rtl"}
      style={{
        ...base,
        top: `${item.top}%`,
        transform: "translateY(-50%)",
        animationDuration: `${item.duration}ms`
      }}
    />
  );
}
