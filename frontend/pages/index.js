// Component Imports
import Footer from "@/components/Footer";
import Topbar from "@/components/Topbar";
import Carousel from "@/components/carousel/carousel";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import {
  InputText,
  InputNumber,
  InputEmail,
  InputPassword,
  InputFile,
  TextArea,
} from "@/components/form/input";
import { SubmitButton } from "@/components/form/button";

// React Imports
import React, { useState, useEffect } from "react";

// Next.js Imports
import Image from "next/image";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

// Data Fetching Imports
import { fetchCompanyListLogo } from "@/libs/fetching/company";
import { listStoreStatus } from "@/libs/fetching/store";
import { listProductStatus } from "@/libs/fetching/product";
import { sendMessage } from "@/libs/fetching/contact-service";

// Icon Imports
import { FaLocationDot } from "react-icons/fa6";
import { MdOutlinePhoneAndroid } from "react-icons/md";
import {
  FaRegEnvelope,
  FaTwitter,
  FaFacebook,
  FaLinkedin,
} from "react-icons/fa";

export default function Home() {
  const [companyData, setCompanyData] = useState([]);
  const [storeData, setStoreData] = useState([]);
  const [productData, setProductData] = useState([]);
  const router = useRouter();
  const motiveLength = 8;
  const baseURL = "http://localhost:8080";

  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChangeContact = (e) => {
    const { name, value } = e.target;
    setContactData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchingRequirements = async () => {
      const storeLength = async () => {
        try {
          const response = await listStoreStatus();
          if (response?.data) {
            setStoreData(response.data);
          }
        } catch (error) {
          console.error("Error fetching company logos:", error);
        }
      };

      const productLength = async () => {
        try {
          const response = await listProductStatus();
          if (response?.data) {
            setProductData(response.data);
          }
        } catch (error) {
          console.error("Error fetching company logos:", error);
        }
      };

      const fetchCompanyLogo = async () => {
        try {
          const response = await fetchCompanyListLogo();
          if (response?.data) {
            setCompanyData(response.data);
          }
        } catch (error) {
          console.error("Error fetching company logos:", error);
        }
      };

      fetchCompanyLogo();
      storeLength();
      productLength();
    };
    fetchingRequirements();
  }, []);

  const stats = [
    { count: `${companyData.length}+`, label: "Company" },
    { count: `${storeData.length}+`, label: "Store" },
    { count: `${productData.length}+`, label: "Product" },
    // { count: "40+", label: "Global Achievement" },
  ];

  const scrollToMain = () => {
    const mainSection = document.getElementById("main");
    if (mainSection) {
      mainSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const { name, email, message } = contactData;

    if (!name || !email || !message) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      const reqBody = { name, email, message };

      const response = await sendMessage(reqBody);

      if (response.status === 200) {
        toast.success("Pesan terkirim!");
        setContactData({
          name: "",
          email: "",
          message: "",
        });
      } else {
        toast.error(
          `Pesan Gagal Dikirim: ${response.statusText || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Pesan Gagal Dikirim:", error);
      toast.error("Terjadi kesalahan saat mengirim pesan.");
    }
  };

  return (
    <div className="bg-[#F7F7F7] min-h-screen flex flex-col relative">
      <ScrollToTopButton />

      <header className="w-full fixed z-50">
        <Topbar homePage={true} />
      </header>

      {/* Floating Elements Wrapper (Move Before Content) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-40 overflow-hidden">
        <Image
          src={`${baseURL}/uploads/store/motive/default-motive.png`}
          width={150}
          height={150}
          className="absolute top-16 left-0 -translate-x-1/2 -translate-y-1/2"
          alt="MOTIVE"
        />
        <Image
          src={`/header-motive-tokel.png`}
          width={150}
          height={150}
          className="absolute top-20 right-0 translate-x-1/2"
          alt="MOTIVE"
        />
        {Array.from({ length: motiveLength }).map((_, index) => {
          const topValue = `${(index + 1) * 20 + 5}rem`;

          return (
            <Image
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
        <Image
          src="/toko-kelontong-header.png"
          alt="header"
          width={500}
          height={300}
          className="w-full object-cover z-20"
        />
        <div className="z-30 justify-between w-full h-full absolute flex flex-col items-start text-white bg-black bg-opacity-50 px-32 py-12 rounded-md">
          <div className="flex flex-col">
            <p className="text-4xl font-bold">Selamat Datang</p>
            <p className="text-lg">Di Website Toko Kelontong</p>
          </div>
          <button
            onClick={scrollToMain}
            className="mt-4 px-6 py-3 cursor-pointer bg-[#ff6600] text-white font-semibold rounded-full shadow-lg hover:bg-[#e65c00] transition"
          >
            Selengkapnya
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div id="main"></div>
      {/* Section 1 */}
      <section className="p-10 mt-20 flex flex-col items-center gap-2 relative">
        <h1 className="text-5xl text-center max-w-[45vw]">
          Enjoy Your Favorite <br /> Product with Toko Kelontong
        </h1>
        <p className="text-xl text-center max-w-[45vw]">
          Discover tranquility at Ngopi, a sanctuary for unwinding, where your
          evenings are perfected with relaxation and rich flavors.
        </p>
        <button
          onClick={() => router.push("/features")}
          className="mt-4 px-6 py-3 cursor-pointer bg-[#ff6600] text-white font-semibold rounded-full shadow-lg hover:bg-[#e65c00] transition"
        >
          Explore Features
        </button>
        <div className="flex flex-row flex-wrap justify-center gap-3 mt-12 w-full overflow-hidden">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className={`flex overflow-hidden w-28 h-64 bg-slate-500 ${
                index % 2 === 0
                  ? "rounded-tr-[3rem] rounded-bl-[3rem]"
                  : "rounded-tl-[3rem] rounded-br-[3rem]"
              }`}
            >
              <Image
                src={`/Explores/Image-${index + 1}.jpg`}
                width={300}
                height={300}
                alt={`Image-${index + 1}`}
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <div className="flex flex-row mt-12 divide-x divide-slate-500">
          {stats.map((stat, index) => (
            <h3 key={index} className="text-center px-10">
              <p className="text-5xl">{stat.count}</p>
              <span className="text-xl">{stat.label}</span>
            </h3>
          ))}
        </div>
      </section>

      {/* Section 2 */}
      <section className="relative bg-[#EAF8D3] py-16 pb-32 px-16 lg:px-40 mt-20 flex flex-col items-center text-center gap-8">
        <h1 className="text-4xl font-bold text-gray-800 uppercase tracking-wide mb-8">
          About Us
        </h1>
        <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-6xl gap-10">
          {/* Image and design elements */}
          <div className="relative flex-shrink-0">
            <div className="relative flex">
              <div className="w-32 h-64 bg-orange-500 rounded-lg shadow-lg"></div>
              <div className="w-32 h-64 bg-lime-500 rounded-lg shadow-lg -ml-6"></div>
            </div>

            {/* Dynamically generate images with different sizes */}
            {[1, 2].map((num, index) => (
              <div
                key={num}
                className={`absolute ${
                  index === 0
                    ? "top-0 right-0 translate-x-1/4 -translate-y-1/4"
                    : "bottom-0 left-0 -translate-x-1/4 translate-y-1/4"
                }`}
              >
                <div
                  className={`${
                    index === 0 ? "w-56 h-56" : "w-64 h-64"
                  } overflow-hidden shadow-lg rounded border-4 border-white`}
                >
                  <Image
                    src={`/About Us/About-Us-${num}.png`}
                    width={index === 0 ? 224 : 256}
                    height={index === 0 ? 224 : 256}
                    alt={`MOTIVE ${num}`}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Text content */}
          <div className="max-w-xl text-gray-700">
            <p className="text-lg leading-relaxed">
              At <b className="text-orange-600">Toko Kelontong</b>, we provide a
              wide range of daily necessities at affordable prices and the best
              quality. From staple foods and fresh ingredients to household
              essentials, everything is available to meet your needs.
            </p>
            <p className="mt-4 text-lg leading-relaxed">
              With friendly service and carefully selected products, we strive
              to be your trusted and convenient shopping solution. Enjoy
              shopping at <b className="text-orange-600">Toko Kelontong</b>,
              your go-to store for budget-friendly and complete supplies!
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section className="relative py-16 pb-32 lg:px-40 mt-20 flex flex-col items-center text-center gap-8">
        <h1 className="text-4xl font-bold text-gray-800 uppercase tracking-wide mb-8">
          Company That Use Our Services
        </h1>
        <Carousel companyData={companyData} />
      </section>

      {/* Section 4 */}
      <section className="relative bg-[#EAF8D3] py-16 pb-32 px-16 lg:px-40 mt-20 flex flex-col items-center text-center gap-8">
        <h1 className="text-4xl font-bold text-gray-800 uppercase tracking-wide mb-8">
          Contact Us
        </h1>
        <div className="flex flex-col lg:flex-row items-start lg:items-start justify-between w-full max-w-6xl gap-12 px-6 lg:px-0">
          {/* Form Section */}
          <div className="w-full max-w-lg bg-white p-6 rounded-xl shadow-xl flex flex-col gap-3 ">
            <h1 className="text-3xl font-bold text-gray-800 uppercase tracking-wide mb-8">
              Contact Us
            </h1>
            <form onSubmit={handleSendMessage} className="flex flex-col gap-5">
              <InputText
                label="Name"
                name="name"
                value={contactData.name}
                onChange={handleChangeContact}
              />
              <InputEmail
                label="Email"
                name="email"
                value={contactData.email}
                onChange={handleChangeContact}
              />
              <TextArea
                label="Message"
                name="message"
                value={contactData.message}
                onChange={handleChangeContact}
              />
              <SubmitButton content="Send" className="w-full" />
            </form>
          </div>

          {/* Contact Info Section */}
          <div className="w-full max-w-lg flex flex-col items-center gap-6">
            <div className="grid grid-cols-3 gap-5 text-center">
              <div className="flex flex-col items-center gap-2">
                <FaLocationDot className="text-4xl text-[var(--bg-primary)]" />
                <span className="text-gray-700">DIY, Indonesia</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <MdOutlinePhoneAndroid className="text-4xl text-[var(--bg-primary)]" />
                <span className="text-gray-700">+62 822-2506-8682</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <FaRegEnvelope className="text-4xl text-[var(--bg-primary)]" />
                <span className="text-gray-700">carakan@gmail.com</span>
              </div>
            </div>

            <div className="w-full h-[300px] rounded-lg overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d390.60816537725344!2d110.38326426669323!3d-7.7151857436691!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a59320156f21f%3A0x7815052c2e29e70d!2sCarakan%20Sadhana%20Dirgantara!5e1!3m2!1sid!2sid!4v1741753203003!5m2!1sid!2sid"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="flex gap-4 mt-4">
              <FaFacebook className="text-4xl text-[var(--bg-primary)] cursor-pointer hover:text-blue-600 transition" />
              <FaTwitter className="text-4xl text-[var(--bg-primary)] cursor-pointer hover:text-blue-400 transition" />
              <FaLinkedin className="text-4xl text-[var(--bg-primary)] cursor-pointer hover:text-blue-700 transition" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer Motive */}
      <div className="flex justify-center max-h-[30vh] min-h-[30vh] overflow-hidden mt-24 relative w-full z-40">
        <Image
          src={`${baseURL}/uploads/store/motive/default-footer-motive.png`}
          width={400}
          height={100}
          className="absolute rounded-md max-w-full min-w-full object-cover z-10"
          alt="FOOTER MOTIVE"
        />
      </div>

      {/* Footer (Now Flexible & Always at Bottom) */}
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
}
