// components/PlanModal.jsx
import React from "react";

export default function PlanModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div style={styles.backdrop} role="dialog" aria-modal="true" aria-labelledby="no-plan-title">
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.badge}>No Active Plan</div>
          <h2 id="no-plan-title" style={styles.title}>Upgrade to Premium</h2>
          <p style={styles.subtitle}>
            You don’t have an active subscription. Unlock higher limits and premium features by upgrading your plan.
          </p>
        </div>

        <ul style={styles.list}>
          <li>Unlimited time usage</li>
          <li>Priority processing & support</li>
          <li>Access to advanced voices & features</li>
        </ul>

        <div style={styles.actions}>
          <a
            href="https://www.englovoice.com/pricing"
            style={{ ...styles.button, ...styles.primary }}
          >
            Upgrade now
          </a>
         
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(6, 10, 20, 0.55)",
    backdropFilter: "blur(3px)",
    display: "grid",
    placeItems: "center",
    zIndex: 9999,
    padding: "16px",
  },
  card: {
    width: "100%",
    maxWidth: "520px",
    background: "linear-gradient(180deg, #0f1426 0%, #0a0f1d 100%)",
    border: "1px solid rgba(124, 58, 237, 0.3)",
    borderRadius: "16px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
    color: "#eaf0ff",
    padding: "24px",
  },
  header: { marginBottom: "16px" },
  badge: {
    display: "inline-block",
    fontSize: "12px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    padding: "4px 10px",
    borderRadius: "999px",
    border: "1px solid rgba(234, 235, 255, 0.2)",
    marginBottom: "10px",
    color: "#c7d2fe",
  },
  title: { margin: 0, fontSize: "24px", lineHeight: 1.2 },
  subtitle: { margin: "8px 0 0 0", opacity: 0.85 },
  list: {
    margin: "16px 0 0 0",
    paddingLeft: "18px",
    opacity: 0.95,
    lineHeight: 1.6,
  },
  actions: {
    marginTop: "22px",
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },
  button: {
    borderRadius: "10px",
    padding: "10px 14px",
    fontWeight: 600,
    border: "1px solid rgba(124,58,237,0.35)",
    cursor: "pointer",
    textDecoration: "none",
  },
  primary: {
    background:
      "linear-gradient(90deg, rgba(124,58,237,1) 0%, rgba(99,102,241,1) 100%)",
    color: "white",
  },
  ghost: {
    background: "transparent",
    color: "#c7d2fe",
  },
};
