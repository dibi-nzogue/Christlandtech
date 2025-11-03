
import React, { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

export type ComboOption = { id?: string|number|null; label: string };

type Props = {
  options: ComboOption[];
  value: ComboOption[];
  onChange: (val: ComboOption[]) => void;
  placeholder?: string;
  allowCreate?: boolean;
  className?: string;
  containerClassName?: string;
  menuClassName?: string;
  dropdownPlacement?: "bottom-start" | "top-start";
};

const MultiComboCreate: React.FC<Props> = ({
  options, value, onChange, placeholder = "",
  allowCreate = true, className, containerClassName, menuClassName,
  dropdownPlacement = "bottom-start",
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as any)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const selectedIds = new Set(value.map(v => String(v.id ?? v.label)));
  const list = useMemo(() => {
    const q = query.toLowerCase().trim();
    const base = options.filter(o => !selectedIds.has(String(o.id ?? o.label)));
    if (!q) return base;
    return base.filter(o => o.label.toLowerCase().includes(q));
  }, [options, query, selectedIds]);

  const add = (opt: ComboOption) => {
    onChange([...value, opt]);
    setQuery(""); setOpen(false);
  };
  const remove = (opt: ComboOption) => onChange(value.filter(v => (v.id ?? v.label) !== (opt.id ?? opt.label)));

  const exact = options.find(o => o.label.toLowerCase() === query.toLowerCase().trim());
  const showCreate = allowCreate && query.trim() && !exact;

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && query.trim()) {
      e.preventDefault();
      add(exact || { id: undefined, label: query.trim() });
    } else if (e.key === "Escape") setOpen(false);
  };

  return (
    <div ref={ref} className={clsx("relative", containerClassName)}>
      <div className={clsx("border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC] flex flex-wrap gap-2", className)}>
        {value.map((v) => (
          <span key={`${v.id ?? v.label}`} className="px-2 py-1 rounded-md bg-white border text-sm flex items-center gap-1">
            {v.label}
            <button type="button" className="text-gray-500 hover:text-gray-700" onClick={() => remove(v)} aria-label="Supprimer">×</button>
          </span>
        ))}
        <input
          className="bg-transparent flex-1 min-w-[120px] outline-none"
          placeholder={value.length ? "" : placeholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
      </div>

      {open && (
        <div
          className={clsx(
            "absolute z-50 max-h-64 overflow-auto shadow-lg rounded-xl bg-white border w-full",
            dropdownPlacement === "top-start" ? "bottom-full mb-1" : "top-full mt-1",
            menuClassName
          )}
        >
          {list.length === 0 && !showCreate && (
            <div className="px-3 py-2 text-sm text-gray-500">Aucun résultat</div>
          )}
          {list.map((o) => (
            <button
              type="button"
              key={`${o.id ?? o.label}`}
              className="w-full text-left px-3 py-2 hover:bg-gray-100"
              onClick={() => add(o)}
            >
              {o.label}
            </button>
          ))}
          {showCreate && (
            <>
              {list.length > 0 && <div className="h-px bg-gray-200 my-1" />}
              <button type="button" className="w-full text-left px-3 py-2 hover:bg-gray-100"
                onClick={() => add({ id: undefined, label: query.trim() })}
              >
                Créer « {query.trim()} »
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiComboCreate;
