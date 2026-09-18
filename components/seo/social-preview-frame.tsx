export function SocialPreviewFrame() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 24,
        border: "1px solid rgba(247, 244, 239, 0.15)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontSize: 16,
          letterSpacing: "6px",
          textTransform: "uppercase",
          color: "#c2785c",
          marginBottom: 20,
          fontFamily: "sans-serif",
          fontWeight: 600,
        }}
      >
        Artisanal Editorial Fashion
      </div>
      <div
        style={{
          fontSize: 72,
          fontWeight: 400,
          letterSpacing: "8px",
          marginBottom: 24,
          textAlign: "center",
        }}
      >
        VELA WEAR
      </div>
      <div
        style={{
          width: 80,
          height: 1,
          backgroundColor: "#c2785c",
          marginBottom: 28,
        }}
      />
      <div
        style={{
          fontSize: 22,
          fontFamily: "sans-serif",
          fontWeight: 300,
          color: "rgba(247, 244, 239, 0.8)",
          textAlign: "center",
          maxWidth: 700,
          lineHeight: 1.5,
        }}
      >
        Tinh tế trong từng đường may. Chất liệu tự nhiên bền vững.
      </div>
    </div>
  );
}
