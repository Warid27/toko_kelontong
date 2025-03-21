// Component Imports
import Footer from "@/components/Footer";
import Topbar from "@/components/Topbar";
import ScrollToTopButton from "@/components/ScrollToTopButton";

// React Imports
import React, { useState, useEffect } from "react";

// Next.js Imports
import Image from "next/image";
import { useRouter } from "next/router";

// Data Fetching Imports
import { fetchCompanyListLogo } from "@/libs/fetching/company";
import { listStoreStatus } from "@/libs/fetching/store";
import { listProductStatus } from "@/libs/fetching/product";

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

const Features = () => {
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
          className="w-full object-cover"
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

      {/* Section 1 */}
      <section className="z-30 p-10 pt-0 -translate-y-16 flex flex-row justify-center items-end gap-6 relative">
        <div className="text-left bg-white shadow-xl rounded-lg p-5 ">
          <h3 className="text-4xl">Analytics</h3>
          <div className="flex justify-center mt-4">
            <div className="overflow-hidden w-[32rem] h-[32rem] rounded-lg">
              <Image
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
            <Image
              src="https://api-storage.cli.pics/toko-kelontong/product/7e16532b-e2f3-48e1-a369-8e5f004343f5.png"
              alt="Dashboard"
              width={200}
              height={200}
              className="object-cover rounded-lg h-full w-full"
            />
          </div>
          <div className="overflow-hidden w-64 h-96 rounded-lg -translate-y-1/4 translate-x-1/4">
            <Image
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
              <Image
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
            <Image
              src="https://api-storage.cli.pics/toko-kelontong/product/9e50f518-7f40-454b-826d-73273a50fb6b.png"
              alt="Pesanan Masuk"
              width={200}
              height={200}
              className="object-cover rounded-lg h-full w-full"
            />
          </div>
          <div className="overflow-hidden w-96 h-[32rem] rounded-lg -translate-y-1/4 translate-x-1/4">
            <Image
              src="https://api-storage.cli.pics/toko-kelontong/product/134e4aa8-bdfb-4b20-bc96-5bf9ff03db14.png"
              alt="Sales"
              width={200}
              height={200}
              className="object-cover rounded-lg h-full w-full"
            />
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
