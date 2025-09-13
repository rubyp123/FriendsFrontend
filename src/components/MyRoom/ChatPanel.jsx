import { useEffect, useRef, useState } from "react";
import { getSocket } from "../../socket";
import { format, parseISO } from "date-fns";

const API_BASE = "http://localhost:5000";

async function fetchRoomMessages(roomId, { limit = 30, cursor } = {}) {
  const token = localStorage.getItem("token");
  const qs = new URLSearchParams({ roomId, limit: String(limit) });
  if (cursor) qs.set("cursor", cursor);

  const res = await fetch(`${API_BASE}/api/messages?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { messages, nextCursor, hasMore }
}

export default function ChatPanel({ roomId }) {
  const [messages, setMessages] = useState([]); // ascending
  // eslint-disable-next-line no-unused-vars
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(null);

  const didInitialScroll = useRef(false);
  const listRef = useRef(null);
  const bottomRef = useRef(null); //  sentinel at the end of the list
  const myName = localStorage.getItem("name");

  const scrollToBottom = (behavior = "auto") => {
    // Use a small rAF to ensure DOM is painted first
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior });
    });
  };

  useEffect(() => {
    if (!didInitialScroll.current && messages.length > 0) {
      didInitialScroll.current = true;
      scrollToBottom("auto"); // land at last message on open
    }
  }, [messages, roomId]);

  // Initial history load → land at last message
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { messages, nextCursor, hasMore } = await fetchRoomMessages(roomId, { limit: 30 });
        if (!alive) return;
        setMessages(messages);
        setNextCursor(nextCursor);
        setHasMore(hasMore);
        scrollToBottom("auto"); // jump to bottom on open
      } catch (e) {
        console.error("History load failed:", e);
      }
    })();
    return () => (alive = false);
  }, [roomId]);

  // Socket realtime handlers
  useEffect(() => {
    const socket = getSocket();
    socket.emit("join_room", { roomId });

    const onNew = (msg) => {
      if (msg.roomId !== roomId) return;
      setMessages((prev) => (prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]));
      scrollToBottom("smooth"); // auto-scroll on new message
    };

    const onTyping = ({ roomId: rid, userId, name, isTyping }) => {
      if (rid !== roomId) return;
      setTyping(isTyping ? { userId, name } : null);
    };

    socket.on("new_message", onNew);
    socket.on("typing", onTyping);

    return () => {
      socket.off("new_message", onNew);
      socket.off("typing", onTyping);
    };
  }, [roomId]);

  // Load older messages when reaching top (preserve scroll position)
  const loadOlder = async () => {
    if (!hasMore || loadingOlder || messages.length === 0) return;
    setLoadingOlder(true);
    const prevHeight = listRef.current?.scrollHeight || 0;
    try {
      const oldestId = messages[0]._id;
      const { messages: older, nextCursor: next, hasMore: more } = await fetchRoomMessages(roomId, {
        limit: 30,
        cursor: oldestId,
      });
      setMessages((curr) => [...older, ...curr]);
      setNextCursor(next);
      setHasMore(more);

      // keep current viewport anchored after prepending
      requestAnimationFrame(() => {
        const newHeight = listRef.current?.scrollHeight || 0;
        listRef.current?.scrollBy({ top: newHeight - prevHeight });
      });
    } catch (e) {
      console.error("Load older failed:", e);
    } finally {
      setLoadingOlder(false);
    }
  };

  // Detect near-top scrolling
  const onScroll = (e) => {
    const el = e.currentTarget;
    if (el.scrollTop <= 20) loadOlder();
  };

  // Send + typing
  const send = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    const socket = getSocket();
    const tempId = crypto.randomUUID();
    socket.emit("send_message", { roomId, text: trimmed, tempId });
    setText("");
    socket.emit("typing", { roomId, isTyping: false });
    // (we rely on server 'new_message' to arrive and scroll)
  };

  const handleTyping = (val) => {
    setText(val);
    const socket = getSocket();
    socket.emit("typing", { roomId, isTyping: val.length > 0 });
  };

  return (
    <div className=" h-full flex flex-col">
      {/* Messages list */}
      <div
        ref={listRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto p-1 space-y-4 pb-24"
      >
        {loadingOlder && hasMore && (
          <div className="text-xs text-gray-500 text-center py-1">Loading older…</div>
        )}

        {messages.map((m) => (
          <div
            key={m._id}
            className={`max-w-[80%] rounded-2xl px-4 py-1 text-sm relative shadow-md transition-transform hover:scale-[1.01] duration-200
              
              ${
                m.senderName?.trim().toLowerCase() === myName?.trim().toLowerCase()
                  ? "ml-auto bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow"
              }`}
          >
            <div className="text-[11px] opacity-70 mb-1">{m.senderName}</div>
            <div className="flex flex-col">
              <div>{m.text}</div>
              <div className="text-[10px] opacity-70 self-end mt-1">
                {format(parseISO(m.createdAt), "HH:mm")}
              </div>
            </div>
          </div>
        ))}

        {typing && (
          <div className="text-xs text-gray-600 dark:text-gray-400 animate-pulse">
            {typing.name} is typing…
          </div>
        )}

        {/*  sentinel at the bottom to scroll into view */}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="absolute left-0 bottom-0 w-full p-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={send} className="flex items-center gap-2 max-w-3xl mx-auto">
          <input
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm 
                       bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                       focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-inner"
          />
          <button
            type="submit"
            className="inline-flex items-center rounded-full px-5 py-2 text-sm font-medium 
                       bg-gradient-to-r from-teal-500 to-teal-700 text-white 
                       hover:from-teal-600 hover:to-teal-800 shadow-md transition-all"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
