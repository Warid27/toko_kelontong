import React, { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import Topbar from "@/components/Topbar";
import Image from "next/image";
import Card from "@/components/Card";
import client from "@/libs/axios";
import { useRouter } from "next/router";
import Link from "next/link";

import { getCompanyData } from "@/libs/fetching/company";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedExtra, setSelectedExtra] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartUpdate, setCartUpdated] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [queryReady, setQueryReady] = useState(false);

  const [itemCampaignList, setItemCampaignList] = useState([]);
  const [companyData, setCompanyData] = useState([]);
  const [categoryProductList, setCategoryProductList] = useState([]);
  const router = useRouter();
  const [stores, setStores] = useState([]);

  const motiveLength = 5;

  useEffect(() => {
    if (router.isReady) {
      setQueryReady(true);
    }
  }, [router.isReady]);

  useEffect(() => {
    if (!queryReady) return;

    const { id_store, id_company, id_category_product } = router.query;

    const login = async () => {
      if (!localStorage.getItem("token")) {
        try {
          const response = await client.post(
            "/login",
            {
              username: "customer",
              password: "customer",
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

        } catch (error) {
          console.error("Login error:", error);
        }
      }
    };
    const getCompany = async (id) => {
      const data = await getCompanyData(id);
      return data;
    };
    const fetchCategoryProduct = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await client.post(
          "/category/listcategories",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCategoryProductList(response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
      }
    };

    const fetchItemCampaign = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await client.post(
          "/itemcampaign/listitemcampaigns",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setItemCampaignList(response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching item campaign:", error);
        return [];
      }
    };

    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await client.post(
          "/product/listproduct",
          {
            id_store,
            id_company,
            id_category_product,
            status: 0,
            params: "order",
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProducts(response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching products:", error);
        return [];
      }
    };

    const getStores = async () => {
      try {
        if (!id_store) {
          console.error("id_store is missing in query");
          return [];
        }

        const token = localStorage.getItem("token");
        const response = await client.post(
          "/store/getstore",
          { id: id_store },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const storeData = response.data;

        // If decoration details exist, update global CSS variables
        if (storeData.decorationDetails) {
          const { primary, secondary, tertiary, danger } =
            storeData.decorationDetails;

          document.documentElement.style.setProperty("--bg-primary", primary);
          document.documentElement.style.setProperty(
            "--bg-secondary",
            secondary
          );
          document.documentElement.style.setProperty("--bg-tertiary", tertiary);
          document.documentElement.style.setProperty("--bg-danger", danger);
        }

        setStores(storeData); //warod warod warod warod warod warod awrod awrods
        return storeData;
      } catch (error) {
        console.error("Error fetching stores:", error);
        return [];
      }
    };

    const check_product = async () => {
      await login();
      if (id_store && id_company && id_category_product) {
        fetchProducts();
      }
      if (id_store && id_company) {
        try {
          // Open the cache
          const cache = await caches.open("product-data");

          const response_product = await cache.match(`product_list${id_store}`); // YUD YUD YUD YUD YUD YUD YUD YUD YUD YUD YUD YUD YUD YUD YUD YUDY YUD YUD
          const response_category = await cache.match(
            `category_product${id_store}`
          );
          const response_item_campaign = await cache.match(
            `item_campaign${id_store}`
          );
          const response_store = await cache.match(`store${id_store}`);
          const response_company = await cache.match(`company${id_company}`);
          const response_timestamp = await cache.match(
            `cache_timestamp${id_store}`
          );

          let shouldRevalidate = false;

          // Check if we need to revalidate based on cache age
          if (
            response_product &&
            response_category &&
            response_item_campaign &&
            response_store &&
            response_company &&
            response_timestamp
          ) {
            const timestampData = await response_timestamp.json();
            const cacheAge = Date.now() - timestampData.timestamp;
            // Revalidate if cache is older than 1 hour
            shouldRevalidate = cacheAge > 3600000;
          }

          // Use cached data if available
          if (
            response_product &&
            response_category &&
            response_item_campaign &&
            response_company &&
            response_store
          ) {
            const data_product = await response_product.json();
            const data_category = await response_category.json();
            const data_item_campaign = await response_item_campaign.json();
            const data_store = await response_store.json();
            const data_company = await response_company.json();

            setProducts(data_product);
            setCategoryProductList(data_category);
            setItemCampaignList(data_item_campaign);
            setStores(data_store);
            setCompanyData(data_company);
            setIsLoading(false);
            const keys = await cache.keys();
            console.log("Company:", companyData);
          }

          // Fetch fresh data if no cache or cache needs revalidation
          if (
            !response_product ||
            !response_category ||
            !response_item_campaign ||
            !response_store ||
            !response_company ||
            shouldRevalidate
          ) {
            console.log("Fetching fresh data...");

            const data_product = await fetchProducts();
            const data_category_product = await fetchCategoryProduct();
            const data_item_campaign = await fetchItemCampaign();
            const data_store = await getStores();
            const data_company = await getCompany(id_company);

            // Store fresh data in cache
            const cache_product = new Response(JSON.stringify(data_product));
            const cache_category = new Response(
              JSON.stringify(data_category_product)
            );
            const cache_item_campaign = new Response(
              JSON.stringify(data_item_campaign)
            );
            const cache_store = new Response(JSON.stringify(data_store));
            const cache_company = new Response(JSON.stringify(data_company));
            // const cache_image = new Response(data_company_image);
            const cache_timestamp = new Response(
              JSON.stringify({ timestamp: Date.now() })
            );

            // await cache.put("product", cache_product);
            await cache.put(
              `product_list${id_store}`,
              new Response(JSON.stringify(data_product))
            );

            await cache.put(`category_product${id_store}`, cache_category);
            await cache.put(`item_campaign${id_store}`, cache_item_campaign);
            await cache.put(`store${id_store}`, cache_store);
            await cache.put(`company${id_company}`, cache_company);
            // await cache.put("company_image", cache_image);
            await cache.put(`cache_timestamp${id_store}`, cache_timestamp);
            setIsLoading(false);

            // Update UI only if we didn't already load from cache
            if (
              !response_product ||
              !response_category ||
              !response_item_campaign ||
              !response_store ||
              !response_company
            ) {
              setProducts(data_product);
              setCategoryProductList(data_category_product);
              setItemCampaignList(data_item_campaign);
              setStores(data_store);
              setCompanyData(data_company);
              // setImageHeader(data_company_image);
              setIsLoading(false);
            }
          }
        } catch (error) {
          console.error("Error in check_product:", error);
          setIsLoading(false);
          // setError(true);
        }
      } else {
        console.warn("Missing one or more query parameters!");
        setIsLoading(false);
      }
    };

    check_product();
  }, [queryReady, router.query]);

  const handleCartUpdate = () => {
    setCartUpdated((prev) => !prev);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-4 border-gray-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500">
            Fetching products, please wait...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F7F7] min-h-screen relative overflow-hidden">
      {stores && <Topbar onCartUpdate={handleCartUpdate} />}
      {console.log("company", companyData)}
      <div className="absolute w-full h-full flex flex-col items-center z-10">
        {Array.from({ length: motiveLength }).map((_, index) => (
          <div
            key={index}
            className={`flex min-h-[50vh] max-h-[50vh] min-w-[33vh] max-w-[33vh] z-10 ${
              index % 2 === 0
                ? "self-start -translate-x-1/2"
                : "self-end translate-x-1/2"
            }`}
          >
            <Image
              src={
                stores?.decorationDetails?.motive ||
                "http://localhost:8080/uploads/store/motive/default-motive.png"
              }
              width={50}
              height={50}
              className="w-full h-full object-cover"
              alt="MOTIVE"
            />
          </div>
        ))}
      </div>
      <div className="flex justify-center max-h-[55vh] overflow-hidden relative  z-30">
        <Image
          src={stores.banner || "https://placehold.co/500x500"}
          alt="banner"
          layout="responsive"
          width={100}
          height={100}
          className="w-full  object-fill"
        />
      </div>
      <div className="p-10 z-30">CONTENT</div>
      <div className="flex justify-center max-h-[30vh] min-h-[30vh] overflow-hidden relative w-full">
        <Image
          src={
            stores.decorationDetails.footer_motive ||
            "http://localhost:8080/uploads/store/motive/default-footer-motive.png"
          }
          width={400}
          height={100}
          className="absolute rounded-md w-full"
          alt="FOOTER MOTIVE"
        />
      </div>
      <Footer />
    </div>
  );
}
