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
import { SubmitButton, AddButton } from "@/components/form/button";

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
import { MdSpeed, MdTrendingUp, MdBarChart, MdReceipt } from "react-icons/md";

const Features = () => {
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
        <div className="z-30 justify-center items-center w-full h-full absolute flex flex-col  text-white bg-black bg-opacity-50 px-32 py-12 rounded-md">
          <div className="flex flex-col gap-3 justify-center items-center">
            <p className="text-8xl font-bold text-center">Features</p>
            <p className="text-2xl max-w-[65%] text-center">
              TokoKu: A sanctuary for everyday essentials, where your shopping
              experience is perfected with convenience and quality products.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div id="main"></div>

      <section className="p-10 mt-20 flex flex-col items-center gap-2 relative">
        <div></div>
        <div>
          <div>
            <MdSpeed />
            <h1>Performance</h1>
            <p>
              Track key performance indicators (KPIs) such as total revenue,
              conversion rates, and customer engagement. Get real-time insights
              into sales trends and identify areas for improvement.
            </p>
          </div>
          <div>
            <MdTrendingUp />
            <h1>Best Selling</h1>
            <p>
              Discover the top-performing products based on sales volume,
              revenue, and customer demand. This feature helps you identify
              which items drive the most profit and optimize inventory
              accordingly.
            </p>
          </div>
          <div>
            <MdBarChart />
            <h1>Sales</h1>
            <p>
              Monitor overall sales performance with detailed breakdowns by time
              period, product category, or region. Gain a comprehensive view of
              sales trends to make informed business decisions.
            </p>
          </div>
          <div>
            <MdReceipt />
            <h1>Transaction History</h1>
            <p>
              Access a complete log of past transactions, including purchase
              details, payment methods, and timestamps. This ensures
              transparency and helps with financial tracking, refunds, and
              customer service.
            </p>
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
};

export default Features;
