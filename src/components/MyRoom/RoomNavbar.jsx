import { useState } from "react";
import { Menu as MenuIcon, X } from "lucide-react";
import SidedWindow from "./SideWindow";
import ChatPanel from "./ChatPanel";
import Members from "./Members";
import VideoCall from "./VideoCall";
import Calendar from "./Calendar";
import Albums from "./Albums";
// import CalendarButton from "./CalenderButton";


const RoomNavbar = ({room}) => {
  const [isOpen, setIsOpen] = useState(false);          // mobile menu
  const [activePanel , setActivePanel] = useState();
  const [ isCalender , setIsCalendar] = useState(false);
  
  return (
    <>
    <nav className="fixed inset-x-0 top-0 z-50 bg-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: menus */}
          <div className="flex items-center gap-6">
            {/* Mobile toggle (left) */}
            <button
              onClick={() => setIsOpen((s) => !s)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>

            {/* Desktop list menu */}
            <ul className="hidden md:flex items-center gap-3" role="list">
              <li>
                <a href="#" className="">
                    <button
                    type="button"
                    className="bg-[#4e9193] p-2 px-5 rounded-xl hover:bg-[#4e9000] text-gray-900"
                    onClick={() => setActivePanel("chat")}
                    >
                     Chat
                    </button>
                </a>
              </li>
              <li>
                <a href="#" className="">
                    <button
                    type="button"
                    className="bg-pink-300 p-2 px-5 rounded-xl hover:bg-pink-400 text-gray-900"
                    onClick={() => setActivePanel("theme")}
                    >
                     Theme
                    </button>
                </a>
              </li>
              <li>
                <a href="#" className="">
                  <button
                    type="button"
                    className="bg-blue-300 p-2 px-5 rounded-xl hover:bg-blue-400 text-gray-900"
                    onClick={() => setActivePanel("member")}
                    >
                     Members
                    </button>
                </a>
              </li>
              <li>
                <a href="#" className="">
                  <button
                    type="button"
                    className="bg-[#a1732f] p-2 px-5 rounded-xl hover:bg-[#c0805f] text-gray-900"
                    onClick={() => setActivePanel("videocall")}
                    >
                     Video Call
                    </button>
                </a>
              </li>
              <li>
                <a href="#" className="">
                  <button
                      onClick={() => setIsCalendar(true)}
                      className="bg-yellow-400 p-2 px-5 rounded-xl hover:bg-yellow-300 text-gray-900"
                    >
                      Calendar
                    </button>
      
                </a>
              </li>
            </ul>    
          </div>  
        </div>
      </div>

      {
        isCalender ? <Calendar roomId={room.roomId} open={isCalender} onClose={() => setIsCalendar(false)} />
        : ""
      }
      {/* Mobile slide menu */}
      <div className={`md:hidden transition-transform duration-200 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur px-4 pt-2 pb-4 shadow-lg border-t border-gray-200/50 dark:border-gray-800/50">
          <a href="#" className="block py-2 text-gray-900 dark:text-gray-100 hover:text-teal-600">Chat</a>
          <a href="#" className="block py-2 text-gray-900 dark:text-gray-100 hover:text-teal-600">About</a>
          <a href="#" className="block py-2 text-gray-900 dark:text-gray-100 hover:text-teal-600">Services</a>
          <a href="#" className="block py-2 text-gray-900 dark:text-gray-100 hover:text-teal-600">Contact</a>
        </div>
      </div>
    </nav>

    {/* Permanent side window */}
        <SidedWindow
            title={
            activePanel === "chat"
                ? room.name
                : activePanel === "theme"
                ? "Theme Selection"
                : activePanel === "member"
                ? "Members Information"
                : activePanel === "videocall"
                ? "Video Call"
                : "Welcome"
            }
        >
            {activePanel === "chat" && (
            <div className="space-y-3">
                <ChatPanel roomId={room.roomId} />
            </div>
            )}

            {activePanel === "theme" && (
            <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">Choose a theme:</p>
                <div className="flex gap-3">
                <button className="h-10 w-10 rounded-full bg-white border" />
                <button className="h-10 w-10 rounded-full bg-gray-900 border" />
                <button className="h-10 w-10 rounded-full bg-teal-500 border" />
                </div>
            </div>
            )}

            {activePanel === "member" && (
            <div className="space-y-4">
                <Members room = {room} />
            </div>
            )}

            {activePanel==="videocall" && (
              <div className="space-y-4">
                 <VideoCall roomId={room.roomId} />
              </div>
            )}

            {!activePanel && (
                <div className="relative w-full flex flex-col items-center gap-8 p-10">
                  {/* Decorative floating blocks */}
                  <div className="absolute top-10 left-5 w-10 h-10 bg-[#c08872] rounded-md rotate-6"></div>
                  <div className="absolute top-50 left-16 w-16 h-8 bg-[#9a5b4a] rounded-md -rotate-3"></div>
                  <div className="absolute top-100 right-10 w-12 h-12 bg-[#fbe7d6] rounded-md rotate-12"></div>
                  <div className="absolute bottom-0 left-10 w-14 h-14 bg-[#e0944a] rounded-md rotate-2"></div>
                  <div className="absolute top-8 right-14 w-20 h-10 bg-[#84846a] rounded-md -rotate-6"></div>
                  <div className="absolute bottom-10 right-6 w-12 h-20 bg-[#c65358] rounded-md rotate-3"></div>

                  {/* Best */}
                  <div className="w-64 h-40 flex items-center justify-center bg-[#deb3bb] rounded-2xl shadow-lg transform -rotate-2 hover:rotate-0 transition">
                    <span className="text-5xl font-extrabold text-[#9a5b4a] drop-shadow-lg">
                      Best
                    </span>
                  </div>

                  {/* Friends */}
                  <div className="w-72 h-44 flex items-center justify-center bg-[#39666d] rounded-2xl shadow-lg transform rotate-2 hover:rotate-0 transition">
                    <span className="text-5xl font-extrabold bg-gradient-to-r from-yellow-300 via-pink-400 to-red-500 text-transparent bg-clip-text drop-shadow-lg">
                      Friends
                    </span>
                  </div>

                  {/* Forever */}
                  <div className="w-80 h-48 flex items-center justify-center bg-[#4e9193] rounded-2xl shadow-lg transform -rotate-1 hover:rotate-0 transition">
                    <span className="text-5xl font-extrabold bg-gradient-to-r from-teal-400 via-purple-500 to-pink-500 text-transparent bg-clip-text drop-shadow-lg">
                      Forever
                    </span>
                  </div>
                </div>

            )}
        </SidedWindow>
   </>    
  );
};

export default RoomNavbar;
