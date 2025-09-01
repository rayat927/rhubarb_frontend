import React from "react";

export function CustomLoader({
  bg = "#0d1120",        // avatar background color
  accent = "#7a3bff",    // accent color
  progress = 0,
  note = "Initializing…",
}) {
  return (
    <div
      className="ev-loader"
      style={{
        background: bg,
      }}
    >
      <div className="ev-loader__center">
        {/* Orbit animation */}
        <div className="ev-orbit">
          <span className="ev-dot" style={{ background: accent }} />
          <span className="ev-dot" style={{ background: accent }} />
          <span className="ev-dot" style={{ background: accent }} />
          <span className="ev-dot" style={{ background: accent }} />
        </div>

        {/* Brand wordmark-ish pulse */}
        <div className="ev-mark" style={{ color: accent }}>
          EngloVoice
        </div>

        {/* Progress text */}
        <div className="ev-progress">
          {Math.min(100, Math.round(progress))}% • {note}
        </div>
      </div>
    </div>
  );
}