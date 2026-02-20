import React from "react";
import { motion } from "framer-motion";

type OrgNodeProps = {
  title: string;
  name: string;
  subtitle?: string;
  accent?: "primary" | "success" | "warning";
};

const accentStyles: Record<NonNullable<OrgNodeProps["accent"]>, string> = {
  primary: "border-[#00A9DC] bg-[#EAF8FD] text-[#035D75]",
  success: "border-emerald-500 bg-emerald-50 text-emerald-900",
  warning: "border-amber-500 bg-amber-50 text-amber-900",
};

function OrgNode({ title, name, subtitle, accent = "primary" }: OrgNodeProps) {
  return (
    <div
      className={[
        "w-full max-w-sm rounded-xl border p-4 shadow-sm",
        "backdrop-blur-sm",
        accentStyles[accent],
      ].join(" ")}
    >
      <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
        {title}
      </p>
      <h3 className="mt-1 text-base md:text-lg font-bold">{name}</h3>
      {subtitle ? (
        <p className="mt-2 text-sm opacity-80 leading-snug">{subtitle}</p>
      ) : null}
    </div>
  );
}

/**
 * Organigramme responsive:
 * - Mobile: vertical (sans lignes complexes)
 * - Desktop: structure hiérarchique + lignes via SVG
 */
const OrgChart: React.FC = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      aria-label="Organigramme de l'entreprise"
      className="w-full"
    >
      <div className="mx-auto w-full max-w-screen-2xl px-6 sm:px-8 lg:px-10 pt-10 md:pt-14">
        {/* TITRE */}
        <div className="text-center">
          <h2 className="font-semibold text-md md:text-lg lg:text-xl xl:text-2xl">
            Organigramme de l’entreprise
          </h2>
        </div>

        {/* MOBILE (stack) */}
        <div className="mt-10 md:hidden space-y-6">
          <OrgNode title="Président Fondateur" name="Mougoue Christian" />
          <div className="pl-4 border-l-2 border-[#00A9DC]/40">
            <OrgNode
              title="Co-Président Fondateur"
              name="MESSINGA MESSINGA Valère"
            />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="pl-4 border-l-2 border-[#00A9DC]/25">
              <OrgNode
                title="Responsable Technique"
                name="Mogou Kamta Hernandez"
                subtitle="Encadre l’équipe technique"
                accent="success"
              />
              <div className="mt-3 pl-4 border-l-2 border-emerald-500/30">
                <OrgNode
                  title="Équipe"
                  name="Techniciens"
                  subtitle="Interventions, maintenance, support"
                  accent="success"
                />
              </div>
            </div>

            <div className="pl-4 border-l-2 border-[#00A9DC]/25">
              <OrgNode
                title="Directrice Commerciale"
                name="Marie Dongmo"
                subtitle="Développe les ventes et le portefeuille clients"
                accent="warning"
              />
              <div className="mt-3 pl-4 border-l-2 border-amber-500/30">
                <OrgNode
                  title="Équipe"
                  name="Vendeurs"
                  subtitle="Prospection, suivi clients, closing"
                  accent="warning"
                />
              </div>
            </div>

            <div className="pl-4 border-l-2 border-[#00A9DC]/25">
              <OrgNode
                title="Responsable Financier"
                name="(Nom)"
                subtitle="Trésorerie, comptabilité, reporting"
              />
            </div>
          </div>
        </div>

        {/* DESKTOP (diagram + lines) */}
        <div className="relative mt-12 hidden md:block">
          {/* Container */}
          <div className="relative mx-auto max-w-6xl rounded-2xl border border-[#00A9DC]/15 bg-white/60 p-8 shadow-sm">
            {/* SVG lines (desktop only) */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 1200 620"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {/* lines color */}
              <defs>
                <style>
                  {`
                    .l { stroke: rgba(0,169,220,.55); stroke-width: 3; fill: none; }
                    .s { stroke: rgba(0,169,220,.35); stroke-width: 2; fill: none; }
                  `}
                </style>
              </defs>

              {/* Top -> Co-President */}
              <path className="l" d="M600 150 L600 220" />

              {/* Split to 3 columns */}
              <path className="l" d="M600 220 L600 270" />
              <path className="l" d="M260 270 L940 270" />
              <path className="l" d="M260 270 L260 310" />
              <path className="l" d="M600 270 L600 310" />
              <path className="l" d="M940 270 L940 310" />

              {/* Tech -> Technicians */}
              <path className="s" d="M260 420 L260 465" />
            </svg>

            {/* Row 1 */}
            <div className="flex justify-center">
              <div style={{ width: 420 }}>
                <OrgNode title="Président Fondateur" name="Mougoue Christian" />
              </div>
            </div>

            {/* Spacer for line alignment */}
            <div className="h-16" />

            {/* Row 2 */}
            <div className="flex justify-center">
              <div style={{ width: 520 }}>
                <OrgNode
                  title="Co-Président Fondateur"
                  name="MESSINGA MESSINGA Valère"
                />
              </div>
            </div>

            {/* Spacer */}
            <div className="h-16" />

            {/* Row 3: 3 heads */}
            <div className="grid grid-cols-3 gap-8 items-start">
              {/* Tech */}
              <div className="space-y-6">
                <OrgNode
                  title="Responsable Technique"
                  name="Mogou Kamta Hernandez"
                  subtitle="Coordination technique & opérations"
                  accent="success"
                />
                <div className="pl-6">
                  <OrgNode
                    title="Équipe"
                    name="Techniciens"
                    subtitle="Maintenance, installation, support"
                    accent="success"
                  />
                </div>
              </div>

              {/* Commercial */}
              <div className="space-y-6">
                <OrgNode
                  title="Directrice Commerciale"
                  name="Marie Dongmo"
                  subtitle="Stratégie commerciale & croissance"
                  accent="warning"
                />
                <div className="pl-6">
                  <OrgNode
                    title="Équipe"
                    name="Vendeurs"
                    subtitle="Prospection, pipeline, conversion"
                    accent="warning"
                  />
                </div>
              </div>

              {/* Finance */}
              <div className="space-y-6">
                <OrgNode
                  title="Responsable Financier"
                  name="(Nom)"
                  subtitle="Budget, comptabilité, reporting"
                  accent="primary"
                />
              </div>
            </div>
          </div>

          {/* Small note */}
          <p className="text-center text-xs text-[#5A5C62] mt-4">
            Les intitulés et noms peuvent être ajustés selon l’évolution de
            l’équipe.
          </p>
        </div>
      </div>
    </motion.section>
  );
};

export default OrgChart;
