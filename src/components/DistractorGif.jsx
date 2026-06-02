/**
 * GIF hareketleri: yatay (sol→sağ), dikey (yukarı→aşağı), veya sabit yan şerit.
 */
export function DistractorGif({ item, onError }) {
  const base = {
    position: "absolute",
    width: item.size,
    maxWidth: "28%",
    pointerEvents: "none"
  };

  const movement = item.movement ?? "static";

  if (movement === "horizontal") {
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

  if (movement === "vertical") {
    const onLeft = item.area === "left";
    return (
      <img
        src={item.gif}
        alt=""
        onError={onError}
        className={onLeft ? "distractor-gif-move-down-left" : "distractor-gif-move-down-right"}
        style={{
          ...base,
          animationDuration: `${item.duration}ms`
        }}
      />
    );
  }

  // Kenara hizala: merkez yerine sol/sağ kenardan içeri (ekran dışına taşmasın).
  if (item.area === "right") {
    return (
      <img
        src={item.gif}
        alt=""
        onError={onError}
        style={{
          ...base,
          right: "2%",
          left: "auto",
          top: `${item.top}%`,
          transform: "translateY(-50%)"
        }}
      />
    );
  }

  return (
    <img
      src={item.gif}
      alt=""
      onError={onError}
      style={{
        ...base,
        left: "2%",
        top: `${item.top}%`,
        transform: "translateY(-50%)"
      }}
    />
  );
}
