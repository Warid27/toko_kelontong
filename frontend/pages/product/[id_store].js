import React, { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import Topbar from "@/components/Topbar";
import Image from "next/image";
import Card from "@/components/Card";
import client from "@/libs/axios";
import { Modal } from "@/components/Modal";
import { useRouter } from "next/router";
import { FaMinus, FaPlus } from "react-icons/fa6";
import Link from "next/link";

import { categoryProductList } from "@/libs/fetching/category";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedExtra, setSelectedExtra] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartUpdate, setCartUpdated] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [queryReady, setQueryReady] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [itemCampaignList, setItemCampaignList] = useState([]);
  const [companyList, setCompanyList] = useState([]);
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
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("id", response.data.user.id);
          localStorage.setItem("username", response.data.user.username);
          localStorage.setItem("id_store", response.data.user.id_store);
          localStorage.setItem("id_company", response.data.user.id_company);
        } catch (error) {
          console.error("Login error:", error);
        }
      }
    };

    const fetchCategoryProduct = async () => {
      try {
        const response = await client.post("/category/listcategories", {});
        setCategoryProductList(response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
      }
    };

    const fetchItemCampaign = async () => {
      try {
        const response = await client.post(
          "/itemcampaign/listitemcampaigns",
          {}
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

    const cek_product = async () => {
      await login();
      if (id_store && id_company && id_category_product) {
        // fetchProducts_category();
        fetchProducts();
      }
      if (id_store && id_company) {
        try {
          // Open the cache
          const cache = await caches.open("product-data");

          // Check if cached data exists
          // const response_product = await cache.match("product");
          const response_product = await cache.match(`product_list${id_store}`); // YUD YUD YUD YUD YUD YUD YUD YUD YUD YUD YUD YUD YUD YUD YUD YUDY YUD YUD
          const response_category = await cache.match(
            `category_product${id_store}`
          );
          const response_item_campaign = await cache.match(
            `item_campaign${id_store}`
          );
          const response_store = await cache.match(`store${id_store}`);
          // const response_company_image = await cache.match("company_image");
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
            // response_company_image &&
            response_timestamp
          ) {
            const timestampData = await response_timestamp.json();
            const cacheAge = Date.now() - timestampData.timestamp;
            // Revalidate if cache is older than 1 hour
            shouldRevalidate = cacheAge > 3600000;
            // 1 jam
          }

          // Use cached data if available
          if (
            response_product &&
            response_category &&
            response_item_campaign &&
            response_store
          ) {
            const data_product = await response_product.json();
            const data_category = await response_category.json();
            const data_item_campaign = await response_item_campaign.json();
            const data_store = await response_store.json();
            // For image, we need to get the text content
            // const data_company_image = await response_company_image.text();

            setProducts(data_product);
            setCategoryProductList(data_category);
            setItemCampaignList(data_item_campaign);
            setStores(data_store);
            // setImageHeader(data_company_image);
            setIsLoading(false);
            console.log("Data fetched from cache");
            const keys = await cache.keys();
            console.log("Cache keys:", keys);

            console.log("product", products);
            console.log("category", categoryProductList);
            console.log("item campaign", itemCampaignList);
            console.log("store", stores);
          }

          // Fetch fresh data if no cache or cache needs revalidation
          if (
            !response_product ||
            !response_category ||
            !response_item_campaign ||
            !response_store ||
            // !response_company_image ||
            shouldRevalidate
          ) {
            console.log("Fetching fresh data...");

            const data_product = await fetchProducts();
            const data_category_product = await fetchCategoryProduct();
            const data_item_campaign = await fetchItemCampaign();
            const data_store = await getStores();
            // const data_company_image = await fetchCompany();

            // Store fresh data in cache
            const cache_product = new Response(JSON.stringify(data_product));
            const cache_category = new Response(
              JSON.stringify(data_category_product)
            );
            const cache_item_campaign = new Response(
              JSON.stringify(data_item_campaign)
            );
            const cache_store = new Response(JSON.stringify(data_store));
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
            // await cache.put("company_image", cache_image);
            await cache.put(`cache_timestamp${id_store}`, cache_timestamp);
            setIsLoading(false);

            // Update UI only if we didn't already load from cache
            if (
              !response_product ||
              !response_category ||
              !response_item_campaign ||
              !response_store
              // !response_company_image
            ) {
              setProducts(data_product);
              setCategoryProductList(data_category_product);
              setItemCampaignList(data_item_campaign);
              setStores(data_store);
              // setImageHeader(data_company_image);
              setIsLoading(false);
            }

            console.log("Fresh data fetched and cached");
            console.log("product", products);
            console.log("category", categoryProductList);
            console.log("item campaign", itemCampaignList);
            console.log("store", stores);
          }
        } catch (error) {
          console.error("Error in cek_product:", error);
          setIsLoading(false);
          // setError(true);
        }
      } else {
        console.warn("Missing one or more query parameters!");
        setIsLoading(false);
      }
    };

    cek_product();
  }, [queryReady, router.query]);

  const handleCardClick = (product) => {
    try {
      // Filter the products array to find the product with the matching _id
      const selectedProductFromState = products.find(
        (p) => p._id === product._id
      );

      if (selectedProductFromState) {
        setSelectedProduct(selectedProductFromState); // Set the selected product
        setIsModalOpen(true); // Open the modal
      } else {
        console.warn("Product not found in the current state!");
      }
    } catch (error) {
      console.error("Error selecting product:", error);
    }
  };

  const addToCart = async () => {
    const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
    const existingIndex = cartItems.findIndex(
      (item) =>
        item?.product?.id === selectedProduct?._id &&
        item?.selectedExtra?._id === selectedExtra &&
        item?.selectedSize?._id === selectedSize
    );

    if (existingIndex !== -1) {
      // Jika produk dengan extras dan size yang sama sudah ada, tambahkan jumlahnya
      cartItems[existingIndex].quantity += quantity;
    } else {
      const newItem = {
        id_product: selectedProduct?._id || "",
        id_item_campaign: selectedProduct?.id_item_campaign || null,
        id_extras: selectedExtra || null,
        id_size: selectedSize || null,
        quantity,
      };

      cartItems.push(newItem);
    }
    localStorage.setItem("cartItems", JSON.stringify(cartItems));

    closeModal();
    handleCartUpdate();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

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
      <div className="p-10 z-30">
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
        <div className="justify-items-start mt-10 space-x-4 flex z-30">
          {categoryProductList?.map((cpl) => {
            const { id_store, id_company, id_category_product } = router.query;

            return (
              <Link
                key={cpl._id}
                href={`/product/${id_store}?id_company=${id_company}&id_category_product=${cpl._id}`}
                className={`hover:brightness-75 p-3 text-white rounded-md flex-1 font-semibold z-30 ${
                  cpl._id == id_category_product
                    ? "bg-[var(--bg-primary)] "
                    : "bg-[var(--bg-tertiary)] "
                }`}
              >
                <button className="flex items-center justify-center w-full h-full">
                  {cpl.name_category}
                </button>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 space-y-6 relative min-h-[200vh] z-30">
          <h2 className="font-bold text-4xl mb-4">Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.length === 0 ? (
              <p>Produk Tidak Ada</p>
            ) : (
              products.map((product) => {
                const today = new Date().toISOString().split("T")[0];
                const campaign = itemCampaignList.find(
                  (icl) =>
                    icl._id === product.id_item_campaign &&
                    icl.start_date <= today &&
                    icl.end_date >= today
                );

                const discountValue = campaign?.value || 0;
                const discountedPrice = Math.max(
                  product.sell_price * (1 - discountValue),
                  0
                );
                const originalPrice = product.sell_price;

                return (
                  <div
                    className="flex justify-center max-h-[55vh] relative"
                    key={product._id}
                    onClick={
                      product?.id_stock
                        ? product.id_stock.amount - (product.orderQty || 0) > 0
                          ? () => handleCardClick(product)
                          : () => {}
                        : () => {}
                    }
                  >
                    <Card
                      className="w-full object-cover"
                      image={product.image || "https://placehold.co/500x500"}
                      nama={product.name_product}
                      stock={Math.max(
                        product?.id_stock?.amount - product?.orderQty,
                        0
                      )}
                      diskon={discountValue}
                      harga={`Rp ${new Intl.NumberFormat("id-ID").format(
                        discountedPrice
                      )}`}
                      hargaDiskon={
                        discountValue
                          ? `Rp ${new Intl.NumberFormat("id-ID").format(
                              originalPrice
                            )}`
                          : null
                      }
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
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

      {isModalOpen && (
        <Modal onClose={closeModal} title={selectedProduct?.name_product}>
          <div>
            <Image
              src={selectedProduct?.image || "https://placehold.co/100x100"}
              alt={selectedProduct?.name_product}
              width={100}
              height={100}
              className="w-[500px] h-[550px] mb-4"
            />
            <p className="text-xl font-bold">{selectedProduct?.name_product}</p>
            <p>{selectedProduct?.deskripsi}</p>
            <p className="hidden">{selectedProduct?.product_code}</p>

            <p className="font-semibold mt-4 mb-2">Extras</p>
            <div className="flex flex-wrap space-x-2">
              {selectedProduct?.id_extras?.extrasDetails.map((extra) => (
                <button
                  key={extra._id}
                  className={`p-2 rounded-md ${
                    selectedExtra === extra._id
                      ? "bg-[#FDDC05] text-black font-semibold"
                      : "bg-white border-[#FDDC05] border-2"
                  }`}
                  onClick={() => setSelectedExtra(extra._id)}
                >
                  {extra.name}
                </button>
              ))}
            </div>

            <p className="font-semibold mt-4 mb-2">Size</p>
            <div className="flex flex-wrap space-x-2">
              {selectedProduct?.id_size?.sizeDetails.map((size) => (
                <button
                  key={size._id}
                  className={`p-2 rounded-md ${
                    selectedSize === size._id
                      ? "bg-[#FDDC05] text-black font-semibold"
                      : "bg-white border-[#FDDC05] border-2"
                  }`}
                  onClick={() => setSelectedSize(size._id)}
                >
                  {size.name}
                </button>
              ))}
            </div>

            {/* Kontrol jumlah produk */}
            <div className="flex items-center place-content-center mt-4">
              <button
                onClick={() => setQuantity(Math.max(0, quantity - 1))}
                className="py-2 px-3 border border-black rounded-md"
              >
                <FaMinus />
              </button>
              {/* Styled input with no spinners */}
              <input
                type="number"
                min={1}
                step={1}
                value={quantity}
                onChange={(e) => {
                  const newQuantity = Number(e.target.value);
                  setQuantity(newQuantity);
                }}
                className="mx-4 w-16 text-center appearance-none bg-transparent border-none focus:outline-none focus:border-b focus:border-black spinner-none"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="py-2 px-3 border border-black rounded-md"
                disabled={quantity >= selectedProduct?.id_stock?.amount} // Prevent exceeding stock
              >
                <FaPlus />
              </button>
            </div>

            {/* Show stock warning message when quantity exceeds available stock */}
            {quantity >
              (selectedProduct?.id_stock?.amount || 0) -
                (selectedProduct?.orderQty || 0) && (
              <p className="text-red-500 mt-2">
                Stok produk ini hanya{" "}
                {(selectedProduct?.id_stock?.amount || 0) -
                  (selectedProduct?.orderQty || 0)}
              </p>
            )}
            <style jsx>{`
              /* Remove spinners for WebKit browsers (Chrome, Safari, etc.) */
              .spinner-none::-webkit-inner-spin-button,
              .spinner-none::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
              }

              /* Remove spinners for Firefox */
              .spinner-none {
                -moz-appearance: textfield;
              }
            `}</style>
            <button
              onClick={addToCart}
              className={`mt-4 w-full p-2 rounded-md ${
                quantity === 0 ||
                quantity >
                  (selectedProduct?.id_stock?.amount -
                    (selectedProduct?.orderQty || 0) || 0)
                  ? "closeBtn"
                  : "addBtn"
              }`}
              disabled={
                quantity === 0 ||
                quantity >
                  (selectedProduct?.id_stock?.amount -
                    (selectedProduct?.orderQty || 0) || 0)
              }
            >
              Tambah ke Keranjang
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
