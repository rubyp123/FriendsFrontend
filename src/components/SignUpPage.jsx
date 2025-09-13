// import { useState } from "react";
import { useState } from "react";
import { Navigate,Link } from "react-router-dom";
import axios from 'axios';
import { toast } from "react-toastify";
import img1 from "../assets/HomePageImg.webp";


const SignUpPage = () =>{
    const [name, setName] = useState()
    const [email, setEmail] = useState()
    const [password, setPassword] = useState()

    const handleSubmit = (e) =>{
        e.preventDefault()
        axios.post("http://localhost:5000/api/auth/register", { name, email, password })
        .then((res) => {
            toast.success(res.data.message);
            console.log(res);
        })
        .catch((err) => {
            if(err.response){
                toast.error(err.response.data.message);
                console.log(err);
            }
            else{
                toast.error("Somthing Went Wrong");
            }
        });
    }

 return <>
    <div className="min-h-screen flex items-center justify-center ">
      <img
          src={img1} // <-- change to your image path if needed
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover "
          loading="eager"
      />
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            required
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <input
            type="email"
            placeholder="Email"
            required
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <input
            type="password"
            placeholder="Password"
            required
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <button
            type="submit"
            className="w-full py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition"
          >
            Sign Up
          </button>
        </form>
        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link to="/login">
            <button className="text-pink-600 font-semibold hover:underline">
              Log In
            </button>
          </Link>
        </p>
      </div>
    </div>
 </>
}

export default SignUpPage;
