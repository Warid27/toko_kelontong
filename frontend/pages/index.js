import React from "react";
import Footer from "@/components/Footer";
import Topbar from "@/components/Topbar";
import Image from "next/image";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  const motiveLength = 5;
  const baseURL = "http://localhost:8080";

  const scrollToMain = () => {
    const mainSection = document.getElementById("main");
    if (mainSection) {
      mainSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="bg-[#F7F7F7] min-h-screen flex flex-col relative">
      <header className="w-full fixed z-50">
        <Topbar homePage={true} />
      </header>

      {/* Floating Elements Wrapper (Move Before Content) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-40">
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
      <section className="p-10 pt-20 z-50 flex flex-col items-center gap-2 relative">
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
      </section>

      {/* Footer Motive */}
      <div className="flex justify-center max-h-[30vh] min-h-[30vh] overflow-hidden relative w-full z-40">
        <Image
          src={`${baseURL}/uploads/store/motive/default-footer-motive.png`}
          width={400}
          height={100}
          className="absolute rounded-md w-full object-cover z-10"
          alt="FOOTER MOTIVE"
        />
      </div>

      {/* Footer (Now Flexible & Always at Bottom) */}
      <footer className="w-full mt-auto z-50">
        <Footer />
      </footer>
    </div>
  );
}
