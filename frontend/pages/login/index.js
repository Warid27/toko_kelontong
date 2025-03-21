import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { loginServices } from "@/libs/fetching/auth";
import { tokenDecoded } from "@/utils/tokenDecoded";
import { toast } from "react-toastify";
import Loading from "@/components/loading";
import { InputText, InputPassword } from "@/components/form/input";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeBubble, setActiveBubble] = useState(null);
  const router = useRouter();

  // Create floating bubbles effect
  const bubbles = Array(8).fill(0);

  useEffect(() => {
    if (localStorage.getItem("unauthorized") === "true") {
      toast.warning("Unauthorized Access: You need to log in first!", {
        position: "top-center",
        autoClose: 5000,
      });
      localStorage.removeItem("unauthorized");
    }

    // Randomly activate bubbles
    const interval = setInterval(() => {
      setActiveBubble(Math.floor(Math.random() * bubbles.length));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);
    try {
      const token = await loginServices({ username, password });

      if (!token) {
        throw new Error("No token received!");
      }

      setTimeout(() => {
        const userData = tokenDecoded();

        if (userData?.rule !== 5) {
          router.push("/dashboard");
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
      className="flex min-h-screen bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900 text-white overflow-hidden relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Animated background elements */}
      {bubbles.map((_, index) => (
        <motion.div
          key={index}
          className={`absolute rounded-full blur-xl opacity-20 ${
            index % 2 === 0 ? "bg-emerald-400" : "bg-teal-500"
          }`}
          animate={{
            scale: activeBubble === index ? [1, 1.5, 1] : [1, 1.1, 1],
            opacity: [0.1, 0.3, 0.1],
            x: [0, Math.random() * 20 - 10, 0],
            y: [0, Math.random() * 20 - 10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          style={{
            width: `${100 + Math.random() * 200}px`,
            height: `${100 + Math.random() * 200}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-900/10 to-transparent pointer-events-none" />

      {/* Left Side - Branding */}
      <motion.div
        className="hidden md:flex flex-col w-1/2 items-center justify-center relative z-10"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-r from-green-500/30 to-teal-500/30 blur-3xl rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 10, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div className="text-center z-10" whileHover={{ scale: 1.05 }}>
          <motion.button
            onClick={() => router.push("/")}
            className="flex flex-col items-center space-y-4"
            whileHover={{ y: -5 }}
          >
            <motion.div
              className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-xl shadow-green-900/20"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-28 h-28 rounded-full bg-gray-900 flex items-center justify-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 text-transparent bg-clip-text">
                  TK
                </h1>
              </div>
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 text-transparent bg-clip-text tracking-wide">
              Toko Kelontong
            </h1>
            <p className="text-gray-300 font-light">
              The future of shopping experience
            </p>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Right Side - Login Form */}
      <motion.div
        className="flex flex-col justify-center items-center w-full md:w-1/2 p-10 z-10"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="w-full max-w-md backdrop-blur-lg bg-gray-800/40 p-10 rounded-2xl shadow-2xl border border-gray-700/50"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.h2
            className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-green-500 text-transparent bg-clip-text"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Welcome Back
          </motion.h2>

          <motion.p
            className="text-gray-400 mb-8"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Login to access your dashboard
          </motion.p>

          <form className="w-full space-y-6" onSubmit={handleLogin}>
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="group"
            >
              <div className="relative">
                {/* <div className="absolute -left-1 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors">
                  <FaUserAstronaut />
                </div> */}
                <InputText
                  label="Username"
                  name="username"
                  value={username}
                  text_color="text-white"
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-gray-800/70 border-gray-700 hover:border-emerald-500 focus:border-green-500 transition-all rounded-lg"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="group"
            >
              <div className="relative">
                {/* <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors">
                  <FaLock />
                </div> */}
                <InputPassword
                  label="Password"
                  name="password"
                  text_color="text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-gray-800/70 border-gray-700 hover:border-emerald-500 focus:border-green-500 transition-all rounded-lg"
                />
              </div>
            </motion.div>

            {errorMessage && (
              <p className="text-red-400 mt-2 text-sm">{errorMessage}</p>
            )}

            <motion.button
              className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-bold rounded-lg shadow-lg transition duration-300 relative overflow-hidden group"
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.span
                className="absolute inset-0 w-full h-full bg-gradient-to-r from-[var(--bg-primary)] to-[var(--bg-secondary)] opacity-0 group-hover:opacity-100 transition-opacity"
                animate={{ x: ["0%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                style={{ filter: "blur(15px)" }}
              />
              <span className="relative z-10">Login</span>
            </motion.button>
          </form>

          <motion.p
            className="text-sm text-gray-400 mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            Don't have an account?{" "}
            <motion.a
              href="/register"
              className="text-emerald-400 hover:text-green-400 transition"
              whileHover={{ scale: 1.05 }}
            >
              Register
            </motion.a>
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Login;
