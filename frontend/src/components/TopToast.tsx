import React, { useEffect, useState } from "react";

type Props = {
  kind?: "success" | "error" | "info";
  message: string;
  durationMs?: number;       // auto close
  onClose?: () => void;
};

const kindStyles: Record<NonNullable<Props["kind"]>, string> = {
  success: "bg-emerald-600",
  error:   "bg-rose-600",
  info:    "bg-sky-600",
};

const TopToast: React.FC<Props> = ({ kind = "success", message, durationMs = 3500, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setVisible(false), durationMs);
    return () => clearTimeout(t);
  }, [durationMs]);

  useEffect(() => {
    if (!visible) {
      const t = window.setTimeout(() => onClose?.(), 250);
      return () => clearTimeout(t);
    }
  }, [visible, onClose]);

  return (
    <div
      aria-live="polite"
      className={`fixed top-4 left-0 right-0 z-[9999] flex justify-center px-4 transition-all duration-200 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
    >
      <div className={`text-white rounded-xl shadow-lg px-4 py-3 ${kindStyles[kind]} max-w-[680px] w-full sm:w-auto`}>
        <div className="flex items-start gap-3">
          <span className="font-semibold">
            {kind === "success" ? "Succès" : kind === "error" ? "Erreur" : "Info"}
          </span>
          <span className="opacity-95">{message}</span>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="ml-auto text-white/90 hover:text-white"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopToast;
