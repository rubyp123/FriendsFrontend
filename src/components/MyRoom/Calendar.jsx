// frontend/src/features/calendar/RoomCalendar.jsx
import { useEffect, useMemo, useRef, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, isToday, parseISO, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { getSocket } from "../../socket";
import axios from "axios";

const backendURL = import.meta.env.VITE_BACKEND_URL;

function ymd(d) {
  return format(d, "yyyy-MM-dd");
}
function ym(d) {
  return format(d, "yyyy-MM");
}

export default function Calendar({ roomId, open, onClose }) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [occasions, setOccasions] = useState({}); // { 'YYYY-MM-DD': {title,time,color,createdByName,...} }
  const [loading, setLoading] = useState(false);

  const [editorFor, setEditorFor] = useState(null);   // 'YYYY-MM-DD' | null
  const [viewerFor, setViewerFor] = useState(null);   // 'YYYY-MM-DD' | null
  const titleRef = useRef(null);
  const timeRef = useRef(null);
  const colorRef = useRef(null);


  function formatMonth(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // ensure 2 digits
    return `${year}-${month}`; // "YYYY-MM"
  }

  // fetch month occasions
  const loadMonth = async (monthDate) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const yyyymm = monthDate instanceof Date ? formatMonth(monthDate) : monthDate;
      const res = await fetch(`${backendURL}/api/calendar/${roomId}/${yyyymm}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const { occasions } = await res.json();
      const map = {};
      for (const oc of occasions) map[oc.date] = oc;
      setOccasions(map);
    } catch (e) {
      console.error("Failed to load occasions:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadMonth(currentMonth);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentMonth, roomId]);

  // socket realtime
  useEffect(() => {
    if (!open) return;
    const socket = getSocket();
    socket.emit("join_room", { roomId });

    const onUpsert = (oc) => {
      // only update if same month displayed
      if (oc.roomId !== roomId) return;
      const sameMonth = oc.date.startsWith(ym(currentMonth));
      if (!sameMonth) return;
      setOccasions((prev) => ({ ...prev, [oc.date]: oc }));
    };
    const onRemove = ({ roomId: rid, date }) => {
      if (rid !== roomId) return;
      if (!date.startsWith(ym(currentMonth))) return;
      setOccasions((prev) => {
        const copy = { ...prev };
        delete copy[date];
        return copy;
      });
    };

    const io = socket;
    io.on("calendar:upsert", onUpsert);
    io.on("calendar:remove", onRemove);
    return () => {
      io.off("calendar:upsert", onUpsert);
      io.off("calendar:remove", onRemove);
    };
  }, [open, roomId, currentMonth]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const saveOccasion = async (dateStr) => {
    const token = localStorage.getItem("token");
    const payload = {
      roomId,
      date: dateStr,
      title: titleRef.current.value,
      time: timeRef.current.value,
      color: colorRef.current.value || "#22c55e",
    };
    const res = await fetch(`${backendURL}/api/calendar/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      alert("Failed to save occasion");
      return;
    }
    const { occasion } = await res.json();
    setOccasions((prev) => ({ ...prev, [occasion.date]: occasion }));
    setEditorFor(null);
  };


  const deleteOccasion = async (dateStr) => {
    const token = localStorage.getItem("token");
    console.log("Deleting date:", dateStr);

    try {
      const res = await axios.delete(`${backendURL}/api/calendar/delete`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { roomId, date: dateStr }, // axios lets us send body with DELETE
      });

      console.log("Backend success:", res.data);

      // success case
      setOccasions((prev) => {
        const copy = { ...prev };
        delete copy[dateStr];
        return copy;
      });
      setViewerFor(null);
      alert(res.data.message || "Occasion deleted successfully!");
    } catch (err) {
      console.error("Error message:", err.response?.data?.message || err.message);
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[60]">
      {/* calendar card */}
      <div className="w-[360px] rounded-2xl border border-gray-500  bg-yellow-100/95  backdrop-blur shadow-xl overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-3 py-2 border-b  border-gray-800">
          <button
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="px-2 py-1 text-sm text-gray-700 rounded hover:bg-pink-400 "
          >
            ‹
          </button>
          <div className="text-gray-600 text-sm font-semibold">
            {format(currentMonth, "MMMM yyyy")}
          </div>
          <button
            onClick={() => setCurrentMonth((m) => subMonths(m, -1))}
            className="px-2 py-1 text-sm text-gray-700 rounded hover:bg-pink-300 "
          >
            ‹
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMonth(new Date())}
              className=" bg-pink-100 text-pink-600 px-2 py-1 text-xs rounded-full border border-gray-700 hover:bg-gray-100 "
            >
              Today
            </button>
            <button
              onClick={onClose}
              className="text-red-700 px-2 py-1 text-sm rounded hover:bg-red-300"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* days header */}
        <div className="grid grid-cols-7 text-[11px] text-gray-500 px-2 py-1">
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
            <div key={d} className="text-center">{d}</div>
          ))}
        </div>

        {/* grid */}
        <div className="grid grid-cols-7 gap-[6px] px-2 pb-2">
          {days.map((d) => {
            const dStr = ymd(d);
            const event = occasions[dStr];
            const inMonth = isSameMonth(d, currentMonth);
            const today = isToday(d);

            return (
              <button
                key={dStr}
                className={`hover:bg-yellow-200 relative h-16 rounded-xl border text-left p-2 group
                  ${inMonth ? "border-gray-800 " : "border-transparent opacity-50"}
                  ${today ? "ring-2 ring-teal-500" : ""}
                `}
                style={
                  event
                    ? { backgroundColor: `${event.color}22`, borderColor: event.color }
                    : undefined
                }
                title={event ? event.title : ""}
                onClick={() => (event ? setViewerFor(dStr) : setEditorFor(dStr))}
              >
                <div className="text-[11px] text-gray-800 ">
                  {format(d, "d")}
                </div>

                {/* event pill */}
                {event && (
                  <div
                    className="absolute bottom-1 left-1 right-1 truncate text-[11px] px-2 py-[2px] rounded-md"
                    style={{ backgroundColor: event.color, color: "white" }}
                  >
                    {event.title}
                  </div>
                )}

                {/* hover tooltip (custom) */}
                {event && (
                  <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap
                                  text-[11px] px-2 py-1 rounded bg-black/80 text-white opacity-0 group-hover:opacity-100 transition">
                    {event.title}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="px-3 pb-3 text-xs text-gray-500">Loading…</div>
        )}
      </div>

      {/* editor popup */}
      {editorFor && (
        <div className="fixed bottom-24 left-4 w-[320px] z-[61] rounded-xl border border-gray-700  bg-red-200  shadow-xl">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-500 ">
            <div className="text-gray-700 text-sm font-semibold">Set Occasion — {editorFor}</div>
            <button onClick={() => setEditorFor(null)} className="text-sm px-2 py-1 rounded hover:bg-red-100 ">✕</button>
          </div>
          <div className="p-3 space-y-3">
            <div>
              <label className="text-gray-700 text-md text-gray-500">Occasion</label>
              <input ref={titleRef} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 bg-white  text-sm" placeholder="e.g., Team Meetup" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-gray-700 text-md text-gray-500">Time</label>
                <input ref={timeRef} type="time" className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm" />
              </div>
              <div>
                <input ref={colorRef} type="color" defaultValue="#22c55e" className="mt-7 h-10 w-10 p-0  " />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setEditorFor(null)} className="px-3 py-2 text-sm rounded-md border hover:bg-red-100 ">Cancel</button>
              <button onClick={() => saveOccasion(editorFor)} className="px-3 py-2 text-sm rounded-md bg-pink-600 text-white hover:bg-pink-700">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* viewer popup */}
      {viewerFor && occasions[viewerFor] && (
        <div className="fixed bottom-24 left-4 w-[320px] z-[61] rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800">
            <div className="text-sm font-semibold">Occasion — {viewerFor}</div>
            <button onClick={() => setViewerFor(null)} className="text-sm px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">✕</button>
          </div>
          <div className="p-3 space-y-2">
            <div className="text-base font-medium">{occasions[viewerFor].title}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Time: {occasions[viewerFor].time || "—"}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Set by: {occasions[viewerFor].createdByName || "Unknown"}
            </div>
            <div className="flex justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Color</span>
                <div className="h-5 w-5 rounded" style={{ backgroundColor: occasions[viewerFor].color }} />
              </div>
              <button
                onClick={() => deleteOccasion(viewerFor)}
                className="px-3 py-2 text-xs rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
