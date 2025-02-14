import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Footer from "@/components/Footer";
import Topbar from "@/components/Topbar";
import Image from "next/image";
import Card from "@/components/Card";
import client from "@/libs/axios";

export default function Home() {
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await client.post("/store/liststore", {});
        setStores(response.data);
      } catch (error) {
        console.error("Error fetching stores:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStores();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const toProducts = (id_store, id_company) => {
    router.push({
      pathname: `/product/${id_store}`,
      query: { id_company }, // Pass the id_store as a query parameter
    });
  };

  return (
    <div className="bg-[#F7F7F7] min-h-screen">
      <Topbar />
      <div className="p-10">
        <div className="flex justify-center">
          <Image
            src="/header.svg"
            alt="header"
            layout="responsive"
            width={200}
            height={200}
            className="w-full"
          />
        </div>
        <div className="justify-items-start mt-10 space-x-4 flex">
          <button className="bg-[#FFA461] hover:bg-[#e68e4f] p-3 rounded-md font-semibold flex-1">
            Promo
          </button>
          <button className="bg-[#FEE66B] hover:bg-[#ebd35c] p-3 rounded-md flex-1 font-semibold">
            Minuman
          </button>
          <button className="bg-[#F7E7C3] hover:bg-[#e4d4b0] p-3 rounded-md flex-1 font-semibold">
            Makanan
          </button>
          <button className="bg-[#DC9A78] hover:bg-[#d39272] p-3 rounded-md flex-1 font-semibold">
            Snack
          </button>
        </div>
        <div className="mt-10 space-y-6">
          <h2 className="font-bold text-4xl mb-4">Stores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map((store) => (
              <Card
                key={store._id}
                onClick={() => toProducts(store._id, store.id_company)}
                image={
                  "https://png.pngtree.com/png-clipart/20230824/original/pngtree-shop-building-icon-picture-image_8324710.png"
                }
                nama={`${store.name}`}
              />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
