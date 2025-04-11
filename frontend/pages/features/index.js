// Component Imports
import Footer from "@/components/Footer";
import Topbar from "@/components/Topbar";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { InputText, InputPassword } from "@/components/form/input";

// React Imports
import React, { useState, useEffect } from "react";
import Select from "react-select";

// Next.js Imports
import ImageWithFallback from "@/utils/ImageWithFallback";
import { useRouter } from "next/router";

// Fetching
import { registerService } from "@/libs/fetching/auth";
import { addDemoCompany } from "@/libs/fetching/company";
import { fetchListType } from "@/libs/fetching/type";

// Icon Imports
import {
  MdSpeed,
  MdTrendingUp,
  MdBarChart,
  MdReceipt,
  MdShoppingCart,
  MdInsertChart,
  MdAssignment,
} from "react-icons/md";
import { FaCheck } from "react-icons/fa";

// Framer Motion Import
import { motion } from "framer-motion";

// Toast Import
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import MapPicker from "@/components/MapPicker";

const Features = () => {
  const router = useRouter();
  const motiveLength = 8;
  const baseURL = "https://tokokube.parisada.id";

  // State Management
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [id_type, setIdType] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [typeList, setTypeList] = useState([]);

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
    <div className="bg-[#F7F7F7] min-h-screen flex flex-col relative">
      <ScrollToTopButton />

      <header className="w-full fixed z-50">
        <Topbar homePage={true} />
      </header>

      {/* Floating Elements Wrapper (Move Before Content) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-40 overflow-hidden">
        <ImageWithFallback
          onError={"https://placehold.co/100x100"}
          src={`${baseURL}/uploads/store/motive/default-motive.png`}
          width={150}
          height={150}
          className="absolute top-16 left-0 -translate-x-1/2 -translate-y-1/2"
          alt="MOTIVE"
        />
        <ImageWithFallback
          onError={"https://placehold.co/100x100"}
          src={`/header-motive-tokel.png`}
          width={150}
          height={150}
          className="absolute top-20 right-0 translate-x-1/2"
          alt="MOTIVE"
        />
        {Array.from({ length: motiveLength }).map((_, index) => {
          const topValue = `${(index + 1) * 20 + 5}rem`;

          return (
            <ImageWithFallback
              onError={"https://placehold.co/100x100"}
              key={index}
              src={`${baseURL}/uploads/store/motive/default-motive.png`}
              width={150}
              height={150}
              style={{ top: topValue }}
              className={`absolute ${
                index % 2 === 0
                  ? "left-0 -translate-x-1/2"
                  : "right-0 translate-x-1/2"
              }`}
              alt="MOTIVE"
            />
          );
        })}
      </div>

      {/* Banner Section */}
      <div className="h-16"></div>
      <div className="flex justify-center max-h-[70vh] overflow-hidden relative z-30">
        <ImageWithFallback
          onError={"https://placehold.co/100x100"}
          src="/toko-kelontong-header.png"
          alt="header"
          width={500}
          height={300}
          className="w-full object-cover"
        />
        <div className="z-30 justify-center items-center w-full h-full absolute flex flex-col text-white bg-black bg-opacity-50 px-32 py-12 rounded-md">
          <div className="flex flex-col gap-3 justify-center items-center">
            <p className="text-8xl font-bold text-center">Features</p>
            <p className="text-2xl max-w-[65%] text-center">
              TokoKu: A sanctuary for everyday essentials, where your shopping
              experience is perfected with convenience and quality products.
            </p>
          </div>
        </div>
      </div>

      {/* Section 1 */}
      <section className="z-30 p-10 pt-0 -translate-y-16 flex flex-row justify-center items-end gap-6 relative">
        <div className="text-left bg-white shadow-xl rounded-lg p-5 ">
          <h3 className="text-4xl">Analytics</h3>
          <div className="flex justify-center mt-4">
            <div className="overflow-hidden w-[32rem] h-[32rem] rounded-lg">
              <ImageWithFallback
                onError={"https://placehold.co/100x100"}
                src="https://api-storage.cli.pics/toko-kelontong/product/a18c4167-1702-4a14-b2df-685a7407cd16.png"
                alt="Analytics"
                width={200}
                height={200}
                className="object-cover h-full w-full"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          {[
            {
              icon: <MdSpeed className="text-6xl text-yellow-500" />,
              title: "Performance",
              description:
                "Track key performance indicators such as revenue, conversion rates, and customer engagement. Gain real-time insights into trends.",
            },
            {
              icon: <MdTrendingUp className="text-6xl text-yellow-500" />,
              title: "Best Selling",
              description:
                "Identify top-performing products based on sales volume and revenue. Optimize your inventory for maximum profitability.",
            },
            {
              icon: <MdBarChart className="text-6xl text-yellow-500" />,
              title: "Sales",
              description:
                "Monitor sales performance across different time periods, categories, or regions to make data-driven business decisions.",
            },
            {
              icon: <MdReceipt className="text-6xl text-yellow-500" />,
              title: "Transaction History",
              description:
                "Access detailed logs of past transactions, including payment methods and timestamps, ensuring transparency and tracking.",
            },
          ].map(({ icon, title, description }, index) => (
            <div
              key={index}
              className="flex flex-col items-start p-6 bg-white shadow-lg rounded-lg text-justify"
            >
              {icon}
              <h1 className="font-bold text-2xl mt-2">{title}</h1>
              <p className="text-gray-600 mt-2 text-justify">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2 */}
      <section className="z-30 p-10 -translate-y-16 flex flex-row justify-evenly items-center relative">
        <div className="absolute inset-0 bg-[var(--bg-secondary)] opacity-50 -z-10"></div>

        <div className="flex flex-col items-center">
          <div className="overflow-hidden w-96 h-56 rounded-lg -translate-x-1/4">
            <ImageWithFallback
              onError={"https://placehold.co/100x100"}
              src="https://api-storage.cli.pics/toko-kelontong/product/7e16532b-e2f3-48e1-a369-8e5f004343f5.png"
              alt="Dashboard"
              width={200}
              height={200}
              className="object-cover rounded-lg h-full w-full"
            />
          </div>
          <div className="overflow-hidden w-64 h-96 rounded-lg -translate-y-1/4 translate-x-1/4">
            <ImageWithFallback
              onError={"https://placehold.co/100x100"}
              src="https://api-storage.cli.pics/toko-kelontong/product/bcc99df7-15eb-4d59-89d0-fc7c61fcb3fb.png"
              alt="Modal"
              width={200}
              height={200}
              className="object-cover rounded-lg h-full w-full"
            />
          </div>
        </div>
        <div className="max-w-96 flex flex-col gap-8">
          <h1 className="text-6xl font-bold flex flex-col">
            <span>Create a Lasting</span>
            <span className="text-[var(--bg-primary)]">Impression</span>
          </h1>
          <p className="text-lg">
            Customers want to know you have their best interest in mind. And
            that&apos;s tough to do when you don&apos;t have all the
            information. With Pano, you&apos;ll have a wide-angle view on every
            customer, giving you full confidence in how to respond and when.
          </p>
        </div>
      </section>

      {/* Section 3 */}
      <section className="z-30 p-10 -translate-y-16 flex flex-row justify-center items-center gap-6 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          {[
            {
              icon: <MdAssignment className="text-6xl text-yellow-500" />,
              title: "Laporan Order",
              description:
                "Lihat riwayat pesanan secara mendetail, termasuk status, jumlah, dan pelanggan. Pantau perkembangan transaksi dengan mudah.",
            },
            {
              icon: <MdShoppingCart className="text-6xl text-yellow-500" />,
              title: "Laporan Penjualan",
              description:
                "Analisis total penjualan dalam periode tertentu. Identifikasi produk terlaris dan tingkatkan strategi pemasaran.",
            },
            {
              icon: <MdInsertChart className="text-6xl text-yellow-500" />,
              title: "Laporan Keuangan",
              description:
                "Pantau arus kas, keuntungan, dan biaya operasional dengan laporan keuangan yang akurat dan terperinci.",
            },
          ].map(({ icon, title, description }, index) => (
            <div
              key={index}
              className={`flex flex-col items-start p-6 bg-white shadow-lg rounded-lg text-justify ${
                index === 2 ? "md:col-span-2 mx-auto w-2/3" : ""
              }`}
            >
              {icon}
              <h1 className="font-bold text-2xl mt-2">{title}</h1>
              <p className="text-gray-600 mt-2 text-justify">{description}</p>
            </div>
          ))}
        </div>
        <div className="text-left bg-white shadow-xl rounded-lg p-5 ">
          <h3 className="text-4xl">Reports</h3>
          <div className="flex justify-center mt-4">
            <div className="overflow-hidden w-[32rem] h-[32rem] rounded-lg">
              <ImageWithFallback
                onError={"https://placehold.co/100x100"}
                src="https://api-storage.cli.pics/toko-kelontong/product/d53a38db-a909-49a6-b3ac-708d9d20d010.png"
                alt="Reports"
                width={200}
                height={200}
                className="object-cover h-full w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 */}
      <section className="z-30 p-10 -translate-y-16 flex flex-row justify-evenly items-center relative">
        <div className="absolute inset-0 bg-[var(--bg-secondary)] opacity-50 -z-10"></div>
        <div className="max-w-96 flex flex-col gap-8">
          <h1 className="text-6xl font-bold flex flex-col">
            <span>Create a Lasting</span>
            <span className="text-[var(--bg-primary)]">Impression</span>
          </h1>
          <p className="text-lg">
            Customers want to know you have their best interest in mind. And
            that&apos;s tough to do when you don&apos;t have all the
            information. With Pano, you&apos;ll have a wide-angle view on every
            customer, giving you full confidence in how to respond and when.
          </p>
        </div>
        <div className="flex flex-col items-center translate-y-20">
          <div className="overflow-hidden w-96 h-56 rounded-lg -translate-x-1/4">
            <ImageWithFallback
              onError={"https://placehold.co/100x100"}
              src="https://api-storage.cli.pics/toko-kelontong/product/9e50f518-7f40-454b-826d-73273a50fb6b.png"
              alt="Pesanan Masuk"
              width={200}
              height={200}
              className="object-cover rounded-lg h-full w-full"
            />
          </div>
          <div className="overflow-hidden w-96 h-[32rem] rounded-lg -translate-y-1/4 translate-x-1/4">
            <ImageWithFallback
              onError={"https://placehold.co/100x100"}
              src="https://api-storage.cli.pics/toko-kelontong/product/134e4aa8-bdfb-4b20-bc96-5bf9ff03db14.png"
              alt="Sales"
              width={200}
              height={200}
              className="object-cover rounded-lg h-full w-full"
            />
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section className="z-30 p-10 -translate-y-16 flex flex-row justify-evenly items-center relative">
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

            <form className="w-full space-y-6" onSubmit={handleRegister}>
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
                />
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <p className="font-semibold mt-4">Address</p>
                <MapPicker
                  name="address"
                  onChange={(e) => setAddress(e.target.value)}
                />
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                <Select
                  id="type"
                  className="basic-single"
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
                  placeholder="Pilih Type..."
                  noOptionsMessage={() => "No Type available"}
                />
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.1 }}
              >
                <InputText
                  id="phone"
                  label="Phone"
                  name="phone"
                  value={phone}
                  text_color="text-white"
                  onChange={(e) => setPhone(e.target.value)}
                />
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.2 }}
              >
                <InputText
                  id="email"
                  label="Email"
                  name="email"
                  value={email}
                  text_color="text-white"
                  onChange={(e) => setEmail(e.target.value)}
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
                    {termsAccepted && (
                      <FaCheck className="text-white text-xs" />
                    )}
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
      </section>

      {/* Footer Motive */}
      <div className="flex justify-center max-h-[30vh] min-h-[30vh] overflow-hidden mt-24 relative w-full z-40">
        <ImageWithFallback
          onError={"https://placehold.co/100x100"}
          src={`${baseURL}/uploads/store/motive/default-footer-motive.png`}
          width={400}
          height={100}
          className="absolute rounded-md max-w-full min-w-full object-cover z-10"
          alt="FOOTER MOTIVE"
        />
      </div>

      {/* Footer */}
      <footer className="w-full mt-auto z-40">
        <Footer
          logo={"/icon_kelontong.svg"}
          keterangan="Experience the epitome of dependable and secure shopping through Toko Kelontong, a premier marketplace for daily necessities that sets new benchmarks in reliability and quality standards."
          address="Jl. Palagan Tentara Pelajar Blok B No.6 Sariharjo, Ngaglik, Tambak Rejo, Sariharjo, Kec. Ngaglik, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55581"
          phone="+62 822-2506-8682"
        />
      </footer>
    </div>
  );
};

export default Features;
