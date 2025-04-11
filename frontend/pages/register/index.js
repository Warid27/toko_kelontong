import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { FaCheck } from "react-icons/fa";
import { toast } from "react-toastify";
import Select from "react-select";
import { InputText, InputPassword } from "@/components/form/input";
import { registerService } from "@/libs/fetching/auth";
import { addDemoCompany } from "@/libs/fetching/company";
import { fetchListType } from "@/libs/fetching/type";
import MapPicker from "@/components/MapPicker";
import { authMessage } from "@/libs/fetching/contact-service";
import CryptoJS from "crypto-js";
import { Modal } from "@/components/Modal";
import { SubmitButton, CloseButton } from "@/components/form/button";

const Register = () => {
  // Router
  const router = useRouter();

  // State Management
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [id_type, setIdType] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [typeList, setTypeList] = useState([]);
  const [codeAuth, setCodeAuth] = useState("");
  const [inputAuth, setInputAuth] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Create floating bubbles effect
  const bubbles = Array(8).fill(0);

  const modalOpen = (param, bool) => {
    setIsAuthModalOpen(bool);
  };

  // Fetch company types on component mount
  useEffect(() => {
    const fetching_requirement = async () => {
      const get_type_list = async () => {
        const data_type = await fetchListType();
        setTypeList(data_type);
      };
      get_type_list();
    };
    fetching_requirement();
  }, []);

  const generateOTP = () => {
    const randomBytes = CryptoJS.lib.WordArray.random(4);
    const hex = randomBytes.toString();

    const intValue = parseInt(hex.slice(0, 8), 16);

    const otp = (intValue % 1000000).toString().padStart(6, "0");

    return otp;
  };

  const authCheck = async (e) => {
    e.preventDefault();

    if (inputAuth != "") {
      if (inputAuth === codeAuth) {
        toast.success("Verifikasi Sukses!");
        handleRegister(e);
      } else {
        toast.error("Kode OTP Salah");
      }
    } else {
      toast.warning("input masih kosong");
    }
  };
  const handleAuth = async (e) => {
    e.preventDefault();

    if (email != "") {
      const code = generateOTP();
      setCodeAuth(code);
      const reqBody = {
        email: email,
        message: code,
      };
      authMessage(reqBody);
      modalOpen("open", true);
    }
  };

  // Handle Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const companyData = {
      name,
      address,
      id_type,
      status: 1,
      phone,
      email,
    };

    try {
      const companyResponse = await addDemoCompany(companyData);

      if (companyResponse.status === 201) {
        const registerData = {
          id_company: companyResponse._id,
          username,
          password,
          rule: 2,
          status: 1,
        };
        const response = await registerService(registerData);
        if (response.status === 200) {
          toast.success("Register akun demo berhasil!");
          router.push("/login");
        }
      }
    } catch (error) {
      setIsError(true);

      if (error.response && error.response.status === 400) {
        setErrorMessage("Invalid input data. Please check your details.");
      } else if (error.response && error.response.status === 401) {
        setErrorMessage("Invalid username or password.");
      } else if (error.response && error.response.status === 409) {
        setErrorMessage("Username already taken!");
      } else {
        setErrorMessage("Registration failed. Please try again later.");
      }
    }
  };

  useEffect(() => {
    if (isError === true) {
      toast.error(errorMessage);
      setIsError(false);
    }
  }, [isError, errorMessage]);

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
            scale: [1, 1.1, 1],
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
              Join our futuristic shopping experience
            </p>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Right Side - Register Form */}
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
            Create Account
          </motion.h2>

          <motion.p
            className="text-gray-400 mb-8"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Join us and experience the future of shopping
          </motion.p>

          <form className="w-full space-y-6" onSubmit={handleAuth}>
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="group"
            >
              <div className="relative">
                <InputText
                  id="username"
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
                <InputPassword
                  id="password"
                  label="Password"
                  name="password"
                  text_color="text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-gray-800/70 border-gray-700 hover:border-emerald-500 focus:border-green-500 transition-all rounded-lg"
                />
              </div>
            </motion.div>

            {/* Additional Company Fields */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <InputText
                id="name"
                label="Company Name"
                name="name"
                value={name}
                text_color="text-white"
                onChange={(e) => setName(e.target.value)}
                className="bg-gray-800/70 border-gray-700 hover:border-emerald-500 focus:border-green-500 transition-all rounded-lg"
              />
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="space-y-2"
            >
              <p className="font-semibold text-gray-300 text-sm">Address</p>
              <MapPicker
                name="address"
                onChange={(e) => setAddress(e.target.value)}
              />
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="space-y-2"
            >
              <p className="font-semibold text-gray-300 text-sm">
                Company Type
              </p>
              <Select
                id="type"
                className="basic-single"
                classNamePrefix="select"
                options={typeList.map((c) => ({
                  value: c._id,
                  label: c.type,
                }))}
                value={
                  typeList
                    .map((c) => ({ value: c._id, label: c.type }))
                    .find((opt) => opt.value === id_type) || null
                }
                onChange={(selectedOption) =>
                  setIdType(selectedOption ? selectedOption.value : "")
                }
                isSearchable
                required
                placeholder="Select company type..."
                noOptionsMessage={() => "No type available"}
                styles={{
                  control: (base) => ({
                    ...base,
                    background: "rgba(31, 41, 55, 0.7)",
                    borderColor: "#4B5563",
                    "&:hover": {
                      borderColor: "#10B981",
                    },
                  }),
                  menu: (base) => ({
                    ...base,
                    background: "rgba(31, 41, 55, 0.9)",
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused
                      ? "rgba(16, 185, 129, 0.2)"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: "rgba(16, 185, 129, 0.2)",
                    },
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: "white",
                  }),
                  input: (base) => ({
                    ...base,
                    color: "white",
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: "#9CA3AF",
                  }),
                }}
              />
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.1 }}
            >
              <InputText
                id="phone"
                label="Phone Number"
                name="phone"
                value={phone}
                text_color="text-white"
                onChange={(e) => setPhone(e.target.value)}
                className="bg-gray-800/70 border-gray-700 hover:border-emerald-500 focus:border-green-500 transition-all rounded-lg"
              />
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <InputText
                id="email"
                label="Email Address"
                name="email"
                value={email}
                text_color="text-white"
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800/70 border-gray-700 hover:border-emerald-500 focus:border-green-500 transition-all rounded-lg"
              />
            </motion.div>

            {errorMessage && (
              <motion.p
                className="text-red-400 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {errorMessage}
              </motion.p>
            )}

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.3 }}
              className="flex items-center"
            >
              <div className="relative">
                <input
                  id="terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={() => setTermsAccepted(!termsAccepted)}
                  className="sr-only"
                  required
                />
                <div
                  onClick={() => setTermsAccepted(!termsAccepted)}
                  className={`w-5 h-5 mr-2 border ${
                    termsAccepted
                      ? "bg-green-500 border-green-500"
                      : "bg-gray-800/70 border-gray-600"
                  } rounded flex items-center justify-center transition-colors cursor-pointer`}
                >
                  {termsAccepted && <FaCheck className="text-white text-xs" />}
                </div>
              </div>
              <label
                htmlFor="terms"
                className="text-sm text-gray-300 cursor-pointer select-none"
              >
                I agree to the{" "}
                <span className="text-emerald-400 hover:text-green-300 transition-colors">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-emerald-400 hover:text-green-300 transition-colors">
                  Privacy Policy
                </span>
              </label>
            </motion.div>

            <motion.button
              className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-bold rounded-lg shadow-lg transition duration-300 relative overflow-hidden group"
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.span
                className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-400 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity"
                animate={{ x: ["0%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                style={{ filter: "blur(15px)" }}
              />
              <span className="relative z-10">Create an account</span>
            </motion.button>
          </form>

          <motion.p
            className="text-sm text-gray-400 mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.4 }}
          >
            Already have an account?{" "}
            <motion.a
              href="/login"
              className="text-emerald-400 hover:text-green-400 transition"
              whileHover={{ scale: 1.05 }}
            >
              Login
            </motion.a>
          </motion.p>

          <motion.p
            className="text-xs text-gray-500 mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.5 }}
          >
            ©2024 All Rights Reserved. Carakan.
          </motion.p>
        </motion.div>
      </motion.div>
      <Modal
        isOpen={isAuthModalOpen}
        onClose={() => modalOpen("open", false)}
        title="Authentikasi"
        width="large"
      >
        <form onSubmit={authCheck}>
          <div className="space-y-4">
            <p className="font-semibold text-black">
              Kami sudah mengirimkan kode otp ke email kamu
            </p>
            <input
              type="text"
              name="otp"
              value={inputAuth}
              onChange={(e) => setInputAuth(e.target.value)}
              className="border rounded-md p-2 w-full bg-gray-100 text-black"
            />
          </div>

          <div className="flex justify-end mt-5 space-x-2">
            <CloseButton onClick={() => modalOpen("open", false)} />
            <SubmitButton label={"confirm"} />
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default Register;
