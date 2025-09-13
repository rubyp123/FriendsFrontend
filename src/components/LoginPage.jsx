import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import img1 from "../assets/HomePageImg.webp";

const LoginPage =({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin =(e) => {
    e.preventDefault();

    axios.post("http://localhost:5000/api/auth/login", { email, password })
    .then((res) => {
        toast.success(res.data.message);
        const { token ,user } = res.data;
        localStorage.setItem("token" , token);
        localStorage.setItem("name", user.name);
        localStorage.setItem("email", res.data.user.email);
        setToken(token);
        navigate("/");
    })

    .catch((err) => {
        if(err.response){
          console.log(err);
          toast.error(err.response.data.message);
        }
        else{
            toast.error("Something went worng!");
        }
    });

  };
  

  return (
    <div className="min-h-screen flex items-center justify-center ">
       <img
          src={img1} // <-- change to your image path if needed
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover "
          loading="eager"
      />
      
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Log In</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <button
            type="submit"
            className="w-full py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition"
          >
            Log In
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-pink-600 font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;