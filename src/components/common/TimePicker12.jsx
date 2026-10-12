import React from "react";
import { nowTime } from "../../utils/fare";

// The native <input type="time"> follows the OS clock format, so on 24-hour
// machines customers saw "19:45" ("railway time"). This picker always shows a
// 12-hour clock with AM/PM, while the value stays "HH:mm" (24h) for the API.

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

const split = (value) => {
  const [h, m] = String(value || "").split(":").map(Number);
  if (!Number.isFinite(h)) return null;
  return { hour: h % 12 || 12, minute: String(Number.isFinite(m) ? m : 0).padStart(2, "0"), pm: h >= 12 };
};

const join = ({ hour, minute, pm }) => {
  const h24 = (Number(hour) % 12) + (pm ? 12 : 0);
  return `${String(h24).padStart(2, "0")}:${minute}`;
};

/**
 * value / onChange("HH:mm"). An empty value shows the current time, so the
 * first interaction starts from "now" (callers usually also seed it with
 * nowTime()). `className` styles each select; `id` goes on the hour select.
 */
export default function TimePicker12({ value, onChange, className = "", id, ariaLabel = "Time" }) {
  const parts = split(value) || split(nowTime());
  const update = (patch) => onChange(join({ ...parts, ...patch }));
  const sel = `appearance-none bg-transparent cursor-pointer focus:outline-none ${className}`;
  const opt = "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white";

  return (
    <div className="flex items-center gap-0.5" role="group" aria-label={ariaLabel}>
      <select id={id} aria-label="Hour" value={parts.hour} onChange={(e) => update({ hour: Number(e.target.value) })} className={sel}>
        {HOURS.map((h) => <option key={h} value={h} className={opt}>{h}</option>)}
      </select>
      <span className="opacity-60">:</span>
      <select aria-label="Minute" value={parts.minute} onChange={(e) => update({ minute: e.target.value })} className={sel}>
        {MINUTES.map((m) => <option key={m} value={m} className={opt}>{m}</option>)}
      </select>
      <select aria-label="AM or PM" value={parts.pm ? "PM" : "AM"} onChange={(e) => update({ pm: e.target.value === "PM" })} className={`${sel} ml-1`}>
        <option value="AM" className={opt}>AM</option>
        <option value="PM" className={opt}>PM</option>
      </select>
    </div>
  );
}
