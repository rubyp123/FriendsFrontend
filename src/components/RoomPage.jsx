import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import RoomNavbar from "./MyRoom/RoomNavbar";
import LoginPage from "./LoginPage";
import Albums from "./MyRoom/Albums";
const backendURL = import.meta.env.VITE_BACKEND_URL;

export default function RoomPage() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get(`${backendURL}/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setRoom(res.data))
      .catch((err) => console.error(err));
  }, [roomId, token]);

  if(!token){
    return <LoginPage/>;
  }

  if (!room) {
    return <p className="text-center mt-20">Loading room...</p>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-100 to-indigo-100">
      <RoomNavbar room = {room} />
      <div className="p-10 pt-20">
        <Albums room={room}/>
      </div>
    </div>
  );
}
