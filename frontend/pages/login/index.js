import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { loginServices } from "@/libs/fetching/auth";
import { tokenDecoded } from "@/utils/tokenDecoded";
import { toast } from "react-toastify";
import Loading from "@/components/loading";
import ThreeDModel from "@/components/form/ThreeDModels";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("unauthorized") === "true") {
      toast.warning("Unauthorized Access: You need to log in first!", {
        position: "top-center",
        autoClose: 5000,
      });
      localStorage.removeItem("unauthorized");
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true); // Set loading state to true when login starts
    try {
      const token = await loginServices({ username, password });

      if (!token) {
        throw new Error("No token received!");
      }

      // Ensure token is stored before decoding
      setTimeout(() => {
        const userData = tokenDecoded(); // Get token from storage

        if (userData?.rule !== 5) {
          router.push("/dashboard"); // Use push() to prevent back navigation
        } else {
          router.push("/");
        }
      }, 100);
    } catch (error) {
      console.error(error);
      toast.error("Login Failed: Invalid username or password", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };
  if (isLoading === true) {
    return <Loading />;
  }
  return (
    <motion.div
      className="flex min-h-screen bg-gray-900 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Left Side */}
      <div className="flex flex-col md:flex w-1/2 items-center justify-center bg-green-600 relative">
        <motion.div
          className="absolute w-80 h-80 bg-green-500/40 blur-3xl rounded-full top-10 left-10"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        />
        <button
          onClick={() => {
            router.push("/");
          }}
          className="py-5"
        >
          <h1 className="text-4xl font-bold">Toko Kelontong</h1>
        </button>
        <div className="w-full h-full">
          <ThreeDModel />
        </div>
      </div>

      {/* Right Side */}
      <motion.div
        className="flex flex-col justify-center items-center w-full md:w-1/2 p-10"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2
          className="text-4xl font-bold mb-6 text-green-400"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Welcome Back
        </motion.h2>

        <form className="w-full max-w-sm" onSubmit={handleLogin}>
          <div className="mb-4">
            <label
              className="text-sm font-bold text-gray-300"
              htmlFor="username"
            >
              Username
            </label>
            <input
              className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-4 relative">
            <label
              className="text-sm font-bold text-gray-300"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-white transition"
              >
                {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <p className="text-red-400 mt-2 text-sm">{errorMessage}</p>
          )}

          <button
            className="w-full py-3 bg-green-500 hover:bg-green-400 text-gray-900 font-bold rounded-lg shadow-lg mt-4 transition duration-300"
            type="submit"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-4">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-green-400 hover:text-green-300 transition"
          >
            Register
          </a>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Login;
