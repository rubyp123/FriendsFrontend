import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function JoinRoom() {
  const [roomId, setRoomId] = useState("");  //  user enters Room ID
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleJoinRoom = () => {
    if (!roomId) {
      toast.error("Please enter a Room ID");
      return;
    }

    axios.post(
      `http://localhost:5000/api/rooms/join/${roomId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then((res) => {
      toast.success(res.data.message);
      setRoomId(""); // clear input

      // Redirect to RoomPage
      navigate(`/room/${roomId}`);
    })
    .catch((err) => {
      if (err.response) toast.error(err.response.data.message);
      else toast.error("Something went wrong!");
    });
  };

  return (
    <div className="mt-8 w-96 p-6 rounded-lg shadow bg-[#fbe7d6]">
      <h2 className="text-xl font-semibold mb-4">Join a Room</h2>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        <button
          onClick={handleJoinRoom}
          className="px-4 py-2 bg-[#4e9193] text-white rounded-lg hover:bg-teal-600"
        >
          Join
        </button>
      </div>
    </div>
  );
}
