import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Footer from "@/components/Footer";
import Topbar from "@/components/Topbar";
import Image from "next/image";
import Card from "@/components/Card";
import { loginServices } from "@/libs/fetching/auth";
import { fetchStoreList } from "@/libs/fetching/store";

const DevelopmentHome = () => {
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loginAndFetchStores = async () => {
      try {
        let token = localStorage.getItem("token");
        if (!token) {
          const reqBody = {
            username: "customer",
            password: "customer",
          };
          const response = await loginServices(reqBody);
          token = response;
          if (token) {
            localStorage.setItem("token", token);
          } else {
            throw new Error("Failed to retrieve token");
          }
        }

        // Now fetch stores using the valid token
        const fetchStores = async () => {
          try {
            const data = await fetchStoreList();

            const filteredStores = data.filter(
              (store) => store.status === 0 // Active stores
            );

            setStores(filteredStores);
          } catch (error) {
            console.error("Error fetching stores:", error);
          } finally {
            setIsLoading(false);
          }
        };

        await fetchStores();
      } catch (error) {
        console.error("Login error:", error);
        setIsLoading(false);
      }
    };

    loginAndFetchStores();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const toProducts = (id_store, id_company) => {
    router.push({
      pathname: `/product/${id_store}`,
      query: { id_company },
    });
  };

  return (
    <div className="bg-[#F7F7F7] min-h-screen">
      <Topbar />
      <div className="p-10">
        <div className="flex justify-center">
          <Image
            src="/banner kelontong.png"
            alt="header"
            layout="responsive"
            width={200}
            height={200}
            className="w-full"
          />
        </div>
        <div className="mt-10 space-y-6">
          <h2 className="font-bold text-4xl mb-4">Stores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map((store) => (
              <Card
                key={store._id}
                onClick={() => toProducts(store._id, store.id_company)}
                image={
                  store.icon ||
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
};

export default DevelopmentHome;
