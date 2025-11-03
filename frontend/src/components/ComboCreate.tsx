import React, { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

export type ComboOption = {
  id?: string | number | null;
  label: string;
};

type Props = {
  options: ComboOption[];
  value: ComboOption | null;
  onChange: (opt: ComboOption | null) => void;
  placeholder?: string;
  allowCreate?: boolean;
  className?: string;
  containerClassName?: string;
  menuClassName?: string;
  dropdownPlacement?: "bottom-start" | "top-start";
};

const ComboCreate: React.FC<Props> = ({
  options,
  value,
  onChange,
  placeholder = "",
  allowCreate = true,
  className,
  containerClassName,
  menuClassName,
  dropdownPlacement = "bottom-start",
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState<string>(value?.label ?? "");
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as any)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // keep input in sync when value is set from outside
  useEffect(() => {
    setQuery(value?.label ?? "");
  }, [value?.label]);

  const list = useMemo(() => {
    const q = (query || "").toLowerCase().trim();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const pick = (opt: ComboOption) => {
    onChange(opt);
    setOpen(false);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // if exact match, pick it; else create
      const exact = options.find(
        (o) => o.label.toLowerCase() === query.toLowerCase().trim()
      );
      if (exact) {
        pick(exact);
      } else if (allowCreate && query.trim()) {
        onChange({ id: undefined, label: query.trim() });
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showCreate =
    allowCreate &&
    query.trim().length > 0 &&
    !options.some((o) => o.label.toLowerCase() === query.toLowerCase().trim());

  return (
    <div ref={ref} className={clsx("relative", containerClassName)}>
      <input
        className={clsx(
          "border rounded-lg p-2 bg-gray-100 w-full outline-[#00A9DC]",
          className
        )}
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />

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
              onClick={() => pick(o)}
            >
              {o.label}
            </button>
          ))}

          {showCreate && (
            <>
              {list.length > 0 && <div className="h-px bg-gray-200 my-1" />}
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                onClick={() => {
                  onChange({ id: undefined, label: query.trim() });
                  setOpen(false);
                }}
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

export default ComboCreate;
