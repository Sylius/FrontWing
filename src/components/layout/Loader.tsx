import React, { ReactNode } from "react";

type LoaderProps = {
  loading: boolean;
  children: ReactNode;
};

const Loader: React.FC<LoaderProps> = ({ loading, children }) => {
  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          opacity: loading ? 0.5 : 1,
          pointerEvents: loading ? "none" : "auto",
        }}
      >
        {children}
      </div>

      {loading && (
        <div style={overlayStyle}>
          <div style={spinnerStyle}></div>
        </div>
      )}
    </div>
  );
};

const overlayStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10,
  backgroundColor: "rgba(255, 255, 255, 0.3)",
};

const spinnerStyle: React.CSSProperties = {
  width: "40px",
  height: "40px",
  border: "4px solid #ccc",
  borderTop: "4px solid #333",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};

if (typeof document !== "undefined" && !document.getElementById("loader-spinner-style")) {
  const style = document.createElement("style");
  style.id = "loader-spinner-style";
  style.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default Loader;
