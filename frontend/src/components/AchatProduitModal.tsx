import * as React from "react";
import { createPortal } from "react-dom";
import { MdClose } from "react-icons/md";
import AchatProduit, { type ProduitMini } from "./AchatProduit";

type Props = {
  open: boolean;
  produit: ProduitMini;
  onClose: () => void;
};

const AchatProduitModal: React.FC<Props> = ({ open, produit, onClose }) => {
  // ESC pour fermer
  React.useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    // lock scroll body
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      {/* overlay */}
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Fermer"
      />

      {/* container */}
      <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-6">
        <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10">
          {/* header */}
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 sm:px-6 py-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wider text-gray-500">
                COMMANDE
              </p>
              <h2 className="truncate text-base sm:text-lg font-extrabold text-gray-900">
                Achat de produit
              </h2>
              <p className="truncate text-sm text-gray-600">
                {produit.nom} {produit.ref ? `• ${produit.ref}` : ""}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              aria-label="Fermer"
            >
              <MdClose className="h-6 w-6" />
            </button>
          </div>

          {/* body scroll */}
          <div className="max-h-[80vh] overflow-y-auto">
            {/* IMPORTANT: AchatProduit en mode compact */}
            <AchatProduit produit={produit} onClose={onClose} compact />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AchatProduitModal;
