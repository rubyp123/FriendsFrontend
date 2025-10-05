import { useState, useEffect } from "react";
import axios from "axios";

const token = localStorage.getItem("token");
const backendURL = import.meta.env.VITE_BACKEND_URL;

const Albums = ({ room }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [albums, setAlbums] = useState([]);
  const email = localStorage.getItem("email");
  const [isOpen, setIsOpen] = useState(false);
  const [openCard, setOpenCard] = useState(null);

  const fetchAlbums = async () => {
    try {
      const res = await axios.get(
        `${backendURL}/api/albums/${room.roomId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(res.data.albums)
      setAlbums(res.data.albums);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    console.log("Albums updated:", albums);
  }, [albums]);

  useEffect(() => {
    fetchAlbums();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("roomId", room.roomId);
      formData.append("userEmail", email);
      formData.append("text", text);

      const res = await axios.post(
        `${backendURL}/api/albums/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchAlbums();
      alert("Uploaded successfully!");
      console.log(res);
    } catch (err) {
      console.error(err);
      alert("Upload failed!");
    }
  };

  const handleDeleteUpload = async (id, userEmail) => {
    try {
      const res = await axios.delete(
        `${backendURL}/api/albums/${id}`,
        {
          data: { userEmail },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(res.data.message);
      fetchAlbums();
    } catch (err) {
      console.error(err);
      alert(err.response.data.message);
    }
  };

  const submitUpload = () => {
    handleUpload(file, text);
    setIsOpen(false);
  };

  return (
    <>
      {/* Cards */}
     {
      albums.length==0 ? 
      <>
      <div> Upload Photos and save you memories.. </div>
      </> : 
      <>
           <div className="pr-100 justify-start grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
                {albums.map((album, i) => {
                  const tilts = [
                    "rotate-3",
                    "-rotate-2",
                    "rotate-1",
                    "rotate-2",
                    "-rotate-1",
                    "-rotate-3",
                  ];
                  const tiltClass = tilts[i % tilts.length];

                  return (
                    <div
                      key={album._id}
                      className={`
                        relative bg-white  shadow-lg 
                        transform ${tiltClass} transition-all duration-300 
                        hover:rotate-0 hover:scale-105
                        w-80 mx-auto p-5
                      `}
                      onClick={() => setOpenCard(album)} // FIXED
                    >
                      {/* Media */}
                      <div className="w-full">
                        {album.mediaUrl && album.mediaUrl.match(/\.mp4$/) ? (
                          <video
                            controls
                            className="rounded-t-2xl w-full border-b dark:border-[#F6D54A]"
                          >
                            <source src={album.mediaUrl} type="video/mp4" />
                          </video>
                        ) : (
                          <img
                            src={album.mediaUrl}
                            alt="upload"
                            className="w-80 h-60 border-b dark:border-[#F6D54A] object-cover"
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              <b className="dark:text-[#3AB3E7]">
                                {album.createdByName}
                              </b>{" "}
                              – {new Date(album.createdAt).toLocaleString()}
                            </p>
                            <p className="mt-2 dark:text-[#F6D54A]">{album.text}</p>
                          </div>

                          <button
                            className="px-3 py-1 text-sm rounded-xl bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-700 dark:text-white ml-4"
                            onClick={(e) => {
                              e.stopPropagation(); // prevent opening popup
                              handleDeleteUpload(album._id, album.userEmail);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

      </>
     }
      {/* Upload Button + Modal */}
      <div className="p-4 space-y-4">
        <button
          className="fixed bottom-3 left-3 z-10 
            bg-[#3AB3E7] hover:bg-[#2495c4]
            text-white font-semibold px-5 py-3 rounded-full shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          Upload
        </button>

        {isOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
            <div
              className="bg-sky-200 w-[50%] p-6 rounded-lg shadow-lg relative
                border-t-4 border-[#F6D54A]"
            >
              <button
                className="absolute top-2 right-2 text-gray-600  hover:text-black "
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>

              <h2 className="text-xl font-bold mb-4 text-center text-gray-600">
                Upload Post
              </h2>

              <input
                type="file"
                className="mb-4 block w-full border p-2 rounded
                  focus:ring-2 focus:ring-[#3AB3E7]
                  bg-white text-gray-500"
                onChange={(e) => setFile(e.target.files[0])}
              />

              <textarea
                placeholder="Write something..."
                className="w-full border p-2 rounded mb-4
                  focus:ring-2 focus:ring-[#F6D54A]
                  bg-white text-gray-500"
                rows="3"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />

              <button
                className="w-full bg-[#E23636] text-white px-4 py-2 rounded
                  hover:bg-[#c02929] "
                onClick={submitUpload}
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Full Card Popup */}
      {openCard && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 w-[70%] max-w-2xl p-6 rounded-xl shadow-xl relative">
            {/* Close button */}
            <button
              className="absolute top-2 right-2 text-gray-600 dark:text-[#3AB3E7] hover:text-black dark:hover:text-white"
              onClick={() => setOpenCard(null)}
            >
              ✕
            </button>

            {/* Media */}
            <div className="mb-4">
              {openCard.mediaUrl && openCard.mediaUrl.match(/\.mp4$/) ? (
                <video controls className="rounded-lg w-full">
                  <source src={openCard.mediaUrl} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={openCard.mediaUrl}
                  alt="upload"
                  className="rounded-lg w-full max-h-96 object-cover"
                />
              )}
            </div>

            {/* Full Content */}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <b className="dark:text-[#3AB3E7]">{openCard.createdByName}</b>{" "}
                – {new Date(openCard.createdAt).toLocaleString()}
              </p>
              <p className="mt-4 text-lg dark:text-[#F6D54A]">
                {openCard.text}
              </p>

              {/* Delete Button */}
              <div className="mt-6 text-right">
                <button
                  className="px-5 py-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-700 dark:text-white"
                  onClick={() => {
                    handleDeleteUpload(openCard._id, openCard.userEmail);
                    setOpenCard(null);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Albums;
