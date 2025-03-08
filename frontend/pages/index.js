import React, { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import Topbar from "@/components/Topbar";
import Carousel from "@/components/carousel/carousel";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import Image from "next/image";
import { useRouter } from "next/router";
import { fetchCompanyListLogo } from "@/libs/fetching/company";
import { listStoreStatus } from "@/libs/fetching/store";
import { listProductStatus } from "@/libs/fetching/product";

export default function Home() {
  const [companyData, setCompanyData] = useState([]);
  const [storeData, setStoreData] = useState([]);
  const [productData, setProductData] = useState([]);
  const router = useRouter();
  const motiveLength = 8;
  const baseURL = "http://localhost:8080";

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
