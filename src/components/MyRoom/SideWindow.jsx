import { useState, useRef, useEffect } from "react";

const SidedWindow = ({
  title = "Side Window",
  defaultWidth = 400, // px
  minWidth = 250,
  maxWidth = 700,
  children,
}) => {
  const [width, setWidth] = useState(defaultWidth);
  const isResizing = useRef(false);

  // Mouse down on resizer
  const startResizing = (e) => {
    e.preventDefault();
    isResizing.current = true;
  };

  // Handle mouse move
  const handleMouseMove = (e) => {
    if (!isResizing.current) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setWidth(newWidth);
    }
  };

  // Stop resizing
  const stopResizing = () => {
    isResizing.current = false;
  };

  // Attach global listeners while dragging
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopResizing);
    };
  });

  return (
    <aside
      className={`hidden md:flex fixed top-0 right-0 bottom-0 z-40
  bg-gradient-to-b from-[#deb3bb] via-[#c08872] via-[#9a5b4a] via-[#39666d]
  via-[#fbe7d6] via-[#e0944a] via-[#84846a] via-[#4e9193]
  via-[#5f3439] via-[#c76832] via-[#e8b794] via-[#c65358]
  via-[#774846] via-[#fcf6e8] via-[#99b3b1] via-[#b0735f]
  via-[#f8dac8] via-[#f0b663] via-[#d79986] to-[#252935]
  backdrop-blur border-l border-gray-200 shadow-inner`}
      style={{ width: `${width}px` }}
    >
      {/* Resizer bar on the left edge */}
      <div
        onMouseDown={startResizing}
        className="absolute left-0 top-0 h-full w-1.5 cursor-col-resize bg-transparent hover:bg-gray-300/40"
      />

      <div className="flex h-full w-full flex-col">
        {/* Header */}
        <div className=" px-4 py-3 border-b border-gray-700 ">
          <h3 className=" text-xl text-base font-bold text-gray-700 ">
            {title}
          </h3>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto pl-4">{children}</div>
      </div>
    </aside>
  );
};

export default SidedWindow;
