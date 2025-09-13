import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import img1 from "../assets/HomePageImg.webp";
import CreateAndJoinRooms from "./CreateAndJoinRooms";
import { useState } from "react";
import Footer from "./Footer";

const LandingPageAfterLogin = ({ setToken }) => {
  const name = localStorage.getItem("name");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    setToken(null); //  updates App state
    navigate("/login");  // redirect to landing page
  };

  return (
    <>
      <Navbar />

      <div className="relative min-h-screen isolate flex flex-col items-center justify-center overflow-x-hidden">
        {/* Background */}
        <img
          src={img1}
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-900/60 via-slate-900/30 to-sky-900/60" />

        {/* Decorative blur blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-10 -z-10 h-80 w-80 rounded-full bg-teal-400/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -z-10 h-96 w-96 rounded-full bg-sky-400/25 blur-3xl"
        />

        {/* Hero Section */}
        <div className="text-center px-6">
          <div className="mx-auto max-w-2xl rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/20 p-8 shadow-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
              Welcome {name ? name : ""}
            </h1>
            <p className="mt-4 text-lg md:text-xl text-white/90">
              Create rooms, connect with friends, and chat seamlessly – all in one place.
            </p>

            <button
              onClick={() => setShowModal(true)}
              className="m-4 px-8 py-3 rounded-2xl bg-[#39666d] text-white font-semibold shadow-lg hover:bg-sky-800 transition"
            >
              Create Room
            </button>

            <button
              onClick={handleLogout}
              className="m-4 px-6 py-3 rounded-xl bg-rose-500/90 text-white font-semibold hover:bg-rose-600 shadow-lg shadow-rose-900/30 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <CreateAndJoinRooms showModal={showModal} setShowModal={setShowModal} />
      <Footer/>
    </>
  );
};

export default LandingPageAfterLogin;
