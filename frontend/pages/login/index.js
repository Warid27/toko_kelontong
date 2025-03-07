import React, { useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa6";
import Swal from "sweetalert2"; // Import SweetAlert2
import { useRouter } from "next/router";
import { loginServices } from "@/libs/fetching/auth";
import { tokenDecoded } from "@/utils/tokenDecoded";
const Login = () => {
  const [username, setUsername] = useState(""); // State for username
  const [password, setPassword] = useState(""); // State for password
  const [showPassword, setShowPassword] = useState(false); // State for showing password
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Reset error message on new login attempt

    const loginData = { username, password };
    try {
      await loginServices(loginData);
      const userData = tokenDecoded();
      if (userData.rule != 5) {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Error during login:", error);

      // Show SweetAlert error message
      if (error.response && error.response.status === 401) {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "Invalid username or password",
          confirmButtonText: "Try Again",
        });
      } else if (error.response && error.response.status === 403) {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "User account not activated",
          confirmButtonText: "Try Again",
        });
        return;
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "An unexpected error occurred. Please try again.",
          confirmButtonText: "OK",
        });
      }
    }
  };
  return (
    <>
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Left Green Section */}
        <div className="w-full md:w-1/2 bg-green-500 flex items-start justify-start p-8">
          <h1 className="text-2xl font-bold text-black">
            <a href="/">Toko Kelontong</a>
          </h1>
        </div>
        {/* Right White Section */}
        <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center p-8">
          <form className="w-full max-w-sm" onSubmit={handleLogin}>
            <h2 className="text-4xl font-bold mb-8">Login</h2>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="username"
              >
                Username
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 border-gray-300 bg-white text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="username"
                placeholder="Username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-4 relative">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="mt-1 block w-full border border-gray-300 bg-white rounded-md p-2"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                >
                  {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                </button>
              </div>
              {errorMessage && (
                <p className="text-red-500 mt-2">{errorMessage}</p>
              )}{" "}
              {/* Display error message */}
            </div>
            <div className="mb-6 flex items-center">
              <input
                className="mr-2 leading-tight"
                type="checkbox"
                id="terms"
              />
              <label className="text-sm text-gray-700" htmlFor="terms">
                I agree to the Terms of Service and Privacy Policy.
              </label>
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-black text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                type="submit"
              >
                Login
              </button>
            </div>
          </form>
          <p className="text-center text-sm text-gray-700 mt-1">
            Don't have an account?
            <a href="/register" className="link-opacity-100">
              <u>Register</u>
            </a>
            .
          </p>
          <p className="text-center text-gray-500 text-xs mt-8">
            ©2024 All Rights Reserved. Carakan.
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
