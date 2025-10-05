import { useEffect, useState } from "react";
import axios from "axios";
const backendURL = import.meta.env.VITE_BACKEND_URL;

export default function MyRooms({reload}) {
  const [rooms, setRooms] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      axios
        .get(`${backendURL}/api/rooms/my-rooms`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setRooms(res.data.rooms))
        .catch((err) => console.error(err));
    }
  }, [token , reload]);

  const copyToClipboard = (roomId) => {
    navigator.clipboard.writeText(roomId);
    alert("Room ID copied!");
  };

  const handleDeleteRoom = (roomId) => {
    if(window.confirm("Are you sure want to delete this room ?")){
        axios.delete(`${backendURL}/api/rooms/delete/${roomId}`, {
            headers : {Authorization : `Bearer ${localStorage.getItem("token")}`}
        })
        .then((res) => {
            alert(res.data.message);
            setRooms(rooms.filter(room => room.roomId !== roomId));
        })
        .catch((err) =>{
            if(err.response) alert(err.response.data.message);
            else alert("Something went wrong!");
        });
    }
  };

return (
  <div className="p-2 mt-10 w-full max-w-6xl mx-auto px-4 bg-[#fbe7d6] rounded">
    <h2 className="text-2xl font-bold mb-6 text-[#774846]">My Rooms</h2>

    {rooms.length === 0 ? (
      <p className="text-[#774846] text-center text-lg">
        No rooms yet. Create one!
      </p>
    ) : (
      <div className="grid grid-rows-3 gap-4">
        {rooms.map((room) => (
          <div
            key={room.roomId}
            onClick={() => window.open(`/room/${room.roomId}`, "_blank")}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl cursor-pointer transform transition hover:-translate-y-1 p-4 flex flex-col justify-between"
          >
            {/* Room Details */}
            <div>
              <h3 className="text-lg font-bold text-[#774846]">{room.name}</h3>
              <p className="text-sm text-gray-500 mt-1">ID: {room.roomId}</p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(room.roomId);
                }}
                className="px-4 py-2 text-sm rounded-xl bg-gray-100 hover:bg-gray-200 transition"
              >
                Copy
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteRoom(room.roomId);
                }}
                className="px-4 py-2 text-sm rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);



}
