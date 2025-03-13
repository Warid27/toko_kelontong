import React, { useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa6";
import { useRouter } from "next/router";
import client from "@/libs/axios";

const Register = () => {
  const [username, setUsername] = useState(""); // State for username
  const [password, setPassword] = useState(""); // State for password
  const [showPassword, setShowPassword] = useState(false); // State for showing password
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
  const router = useRouter();

  // Handle Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Reset error message on new register attempt

    const registerData = {
      username,
      password,
    };

    try {
      const response = await client.post("/register", registerData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("API Response:", response.data);
      localStorage.setItem("token", response.data.token);
      router.push("/login");
    } catch (error) {
      console.error("Error during registration:", error);

      if (error.response && error.response.status === 400) {
        setErrorMessage("Invalid input data. Please check your details.");
      } else if (error.response && error.response.status === 401) {
        setErrorMessage("Invalid username or password.");
      } else {
        setErrorMessage("Registration failed. Please try again later.");
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Green Section */}
      <div className="w-full md:w-1/2 bg-green-500 flex items-start justify-start p-8">
        <h1 className="text-2xl font-bold text-black">Toko Kelontong</h1>
      </div>

      {/* Right White Section */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center p-8">
        <form className="w-full max-w-sm" onSubmit={handleRegister}>
          <h2 className="text-4xl font-bold mb-8">Register</h2>

          {/* Username Field */}
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white shadow appearance-none"
              required
            />
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="mb-6 flex items-center">
            <input
              id="terms"
              className="mr-2 leading-tight"
              type="checkbox"
              required
            />
            <label htmlFor="terms" className="text-sm text-gray-700">
              I agree to the Terms of Service and Privacy Policy.
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <button
              className="bg-black text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              type="submit"
            >
              Create an account
            </button>
          </div>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-700 mt-1">
          Already have an account?{" "}
          <a href="/login" className="link-opacity-100">
            Login
          </a>
          .
        </p>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-8">
          ©2024 All Rights Reserved. Carakan.
        </p>
      </div>
    </div>
  );
};

export default Register;
