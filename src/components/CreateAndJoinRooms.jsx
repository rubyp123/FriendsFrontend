import axios from "axios";
import { useState } from "react";
import JoinRoom from "./JoinRoom";
import MyRooms from "./MyRooms";

const CreateAndJoinRooms = ({ showModal, setShowModal }) => {
  const token = localStorage.getItem("token");
  const [roomName, setRoomName] = useState("");
  const [reload, setReload] = useState(false);

  const handleCreateRoom = () => {
    if (!roomName) {
      alert("Please enter a room name");
      return;
    }
    axios
      .post(
        "http://localhost:5000/api/rooms/create",
        { name: roomName },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setRoomName("");
        setShowModal(false); 
        console.log(res);
        setReload(!reload);
      })
      .catch((err) => console.error(err));
  };

  return (
    <>
      <div className="grid lg:grid-cols-3 grid-cols-1 gap-6 p-10">
        <div className="col-span-1">
            <JoinRoom reload={reload} />
        </div>
        <div className="col-span-2">
            <MyRooms reload={reload} />
        </div>
    </div>


      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-yellow-50 p-6 rounded-2xl shadow-2xl w-96 ring-1 ring-black/10">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 ">
              Create a Room
            </h2>
            <input
              type="text"
              placeholder="Enter room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-300  bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200  hover:bg-gray-300  text-gray-900 "
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRoom}
                className="px-4 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateAndJoinRooms;
