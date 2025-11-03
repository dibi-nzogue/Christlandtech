
import React, {useEffect, useMemo, useRef, useState} from "react";
import {createPortal} from "react-dom";

type Props = {
  label?: string;
  name: string;
  value: string;                // "YYYY-MM-DDTHH:mm" (local)
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  className?: string;
  minDate?: Date;               // borne min (optionnel)
  maxDate?: Date;               // borne max (optionnel)
  stepMinutes?: number;         // pas minutes (default 5)
};

export function parseLocalDateTime(v?: string | null): Date | null {
  if (!v) return null;
  // accepte "YYYY-MM-DDTHH:mm" ou "YYYY-MM-DDTHH:mm:ss"
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(v);
  if (!m) return null;
  const [_, y, mo, d, h, mi, s] = m;
  const dt = new Date(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h),
    Number(mi),
    s ? Number(s) : 0,
    0
  );
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function toLocalValue(dt: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function addDays(d: Date, n: number) {
  const c = new Date(d); c.setDate(c.getDate() + n); return c;
}

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 opacity-70"><path fill="currentColor" d="M12 1.75a10.25 10.25 0 1 0 0 20.5 10.25 10.25 0 0 0 0-20.5Zm.75 5a.75.75 0 0 0-1.5 0v5.19c0 .2.08.39.22.53l3.28 3.28a.75.75 0 1 0 1.06-1.06L12.75 12.2V6.75Z"/></svg>
);

const ChevronLeft = () => (<svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M15.41 7.41 14 6 8 12l6 6 1.41-1.41L10.83 12z"/></svg>);
const ChevronRight = () => (<svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M8.59 16.59 10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>);

const Portal: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [el] = useState(() => document.createElement("div"));
  useEffect(() => {
    el.style.position = "absolute";
    el.style.inset = "0px";
    return () => { /* noop cleanup by GC */ };
  }, [el]);
  return createPortal(children, document.body);
};

const DateTimePicker: React.FC<Props> = ({
  label, name, value, onChange, placeholder = "Choisir une date et l’heure…",
  className, minDate, maxDate, stepMinutes = 5
}) => {
  const inputRef = useRef<HTMLButtonElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => parseLocalDateTime(value) ?? new Date(), [value]);
  const [viewMonth, setViewMonth] = useState<Date>(new Date(selected.getFullYear(), selected.getMonth(), 1));

  // positionnement popover
  const [pos, setPos] = useState<{top: number; left: number; width: number}>({top: 0, left: 0, width: 320});
  useEffect(() => {
    if (!open || !inputRef.current) return;
    const r = inputRef.current.getBoundingClientRect();
    const top = r.bottom + window.scrollY + 6;
    const left = r.left + window.scrollX;
    setPos({ top, left, width: Math.max(320, r.width) });
  }, [open]);

  // fermeture click outside / ESC
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!popRef.current || !inputRef.current) return;
      if (popRef.current.contains(e.target as Node)) return;
      if (inputRef.current.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  // grille du mois
  const weeks = useMemo(() => {
    const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const start = addDays(first, -((first.getDay() + 6) % 7)); // lundi=0
    const rows: Date[][] = [];
    let cur = start;
    for (let w = 0; w < 6; w++) {
      const row: Date[] = [];
      for (let i = 0; i < 7; i++) {
        row.push(cur);
        cur = addDays(cur, 1);
      }
      rows.push(row);
    }
    return rows;
  }, [viewMonth]);

  const commit = (d: Date, h: number, m: number) => {
    const dt = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m, 0, 0);
    if (minDate && dt < minDate) return;
    if (maxDate && dt > maxDate) return;
    onChange(name, toLocalValue(dt));
    setOpen(false);
  };

  const selDay = startOfDay(selected);

  // listes heures/minutes
  const hours = [...Array(24)].map((_, i) => i);
  const minutes = [...Array(Math.floor(60 / stepMinutes))].map((_, i) => i * stepMinutes);

  return (
    <div className={className}>
      {label && <label className="block text-sm text-gray-700 mb-1">{label}</label>}

      <button
        ref={inputRef}
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-2 border rounded-lg bg-white px-3 py-2 text-left hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value ? new Intl.DateTimeFormat(undefined, {
            year:"numeric", month:"2-digit", day:"2-digit",
            hour:"2-digit", minute:"2-digit"
          }).format(parseLocalDateTime(value) as Date) : placeholder}
        </span>
        <span className="shrink-0"><ClockIcon /></span>
      </button>

      {open && (
        <Portal>
          <div
            ref={popRef}
            className="z-[9999] rounded-xl shadow-2xl border bg-white p-3"
            style={{ position: "absolute", top: pos.top, left: pos.left, width: pos.width }}
            role="dialog"
            aria-modal="true"
          >
            {/* Header mois */}
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => setViewMonth(m => new Date(m.getFullYear(), m.getMonth()-1, 1))}
                className="p-2 rounded-md hover:bg-gray-100"
              ><ChevronLeft/></button>
              <div className="font-medium">
                {new Intl.DateTimeFormat(undefined, {month:"long", year:"numeric"}).format(viewMonth)}
              </div>
              <button
                type="button"
                onClick={() => setViewMonth(m => new Date(m.getFullYear(), m.getMonth()+1, 1))}
                className="p-2 rounded-md hover:bg-gray-100"
              ><ChevronRight/></button>
            </div>

            {/* Jours */}
            <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-1">
              {["L","M","M","J","V","S","D"].map((d, i) => (
                <div key={i} className="text-center py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {weeks.flat().map((d, i) => {
                const isOtherMonth = d.getMonth() !== viewMonth.getMonth();
                const isSelected = startOfDay(d).getTime() === selDay.getTime();
                const disabled =
                  (minDate && startOfDay(d) < startOfDay(minDate)) ||
                  (maxDate && startOfDay(d) > startOfDay(maxDate));
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      // lorsque je clique un jour, je garde l'heure/minute sélectionnée
                      commit(d, selected.getHours(), selected.getMinutes());
                    }}
                    className={[
                      "py-2 text-sm rounded-md border",
                      isSelected ? "bg-sky-600 text-white border-sky-600" : "bg-white",
                      isOtherMonth && !isSelected ? "text-gray-400" : "text-gray-900",
                      disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"
                    ].join(" ")}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Heures / Minutes */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <select
                value={selected.getHours()}
                onChange={e => commit(selDay, Number(e.target.value), selected.getMinutes())}
                className="border rounded-lg px-2 py-2 bg-white"
              >
                {hours.map(h => <option key={h} value={h}>{String(h).padStart(2,"0")} h</option>)}
              </select>
              <select
                value={Math.floor(selected.getMinutes() / stepMinutes) * stepMinutes}
                onChange={e => commit(selDay, selected.getHours(), Number(e.target.value))}
                className="border rounded-lg px-2 py-2 bg-white"
              >
                {minutes.map(m => <option key={m} value={m}>{String(m).padStart(2,"0")} min</option>)}
              </select>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              >Fermer</button>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default DateTimePicker;
