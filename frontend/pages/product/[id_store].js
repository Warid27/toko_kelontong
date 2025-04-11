import React, { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import Topbar from "@/components/Topbar";
import ImageWithFallback from "@/utils/ImageWithFallback";
import Card from "@/components/Card";
import { Modal } from "@/components/Modal";
import { useRouter } from "next/router";
import { FaMinus, FaPlus } from "react-icons/fa6";
import Link from "next/link";
import { fetchCategoryList } from "@/libs/fetching/category";
import { getStoreData } from "@/libs/fetching/store";
import { fetchProductsList } from "@/libs/fetching/product";
import { fetchItemCampaignList } from "@/libs/fetching/itemCampaign";
import { loginServices } from "@/libs/fetching/auth";

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
  const [stores, setStores] = useState({});

  const motiveLength = 5;

  useEffect(() => {
    if (router.isReady) {
      setQueryReady(true);
    }
  }, [router.isReady]);

  useEffect(() => {
    console.log("useEffect triggered", {
      queryReady,
      windowExists: typeof window !== "undefined",
    });

    if (!queryReady || typeof window === "undefined") return;

    const { id_store, id_company, id_category_product } = router.query;
    console.log("Query params:", { id_store, id_company, id_category_product });

    const login = async () => {
      try {
        const reqBody = {
          username: "customer",
          password: "customer",
        };
        console.log("Attempting login with:", reqBody);
        const response = await loginServices(reqBody);
        console.log("Login successful:", response);
        return response;
      } catch (error) {
        console.error("Login error:", error);
      }
    };

    const fetchCategoryProduct = async () => {
      try {
        console.log("Fetching categories for store:", id_store);
        const response = await fetchCategoryList(id_store);
        console.log("RESEP CATEGORY", response);
        setCategoryProductList(response);
        return response;
      } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
      }
    };

    const fetchItemCampaign = async () => {
      try {
        console.log("Fetching item campaign:", { id_store, id_company });
        const response = await fetchItemCampaignList(id_store, id_company);
        console.log("RESEP ITEM KEMPING", response);
        setItemCampaignList(response);
        return response;
      } catch (error) {
        console.error("Error fetching item campaign:", error);
        return [];
      }
    };

    const fetchProducts = async () => {
      try {
        console.log("Fetching products with params:", {
          id_store,
          id_company,
          id_category_product,
        });
        const data = await fetchProductsList(
          id_store,
          id_company,
          0,
          "order",
          id_category_product
        );
        console.log("RESEP PRODUK", data);
        setProducts(data);
        return data;
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
        console.log("Fetching store data for:", id_store);
        const data = await getStoreData(id_store);
        console.log("RESEP SETOR", data);
        setStores(data);
        return data;
      } catch (error) {
        console.error("Error fetching stores:", error);
        return [];
      }
    };

    const cek_product = async () => {
      console.log("Starting cek_product");
      await login();

      if (id_store && id_company && id_category_product) {
        console.log("Fetching products - all params present");
        await fetchProducts();
      }

      if (id_store && id_company) {
        try {
          console.log("Opening cache for:", id_store);
          const cache = await caches.open("product-data");

          const response_product = await cache.match(`product_list${id_store}`);
          const response_category = await cache.match(
            `category_product${id_store}`
          );
          const response_item_campaign = await cache.match(
            `item_campaign${id_store}`
          );
          const response_store = await cache.match(`store${id_store}`);
          const response_timestamp = await cache.match(
            `cache_timestamp${id_store}`
          );

          console.log("Cache status:", {
            hasProduct: !!response_product,
            hasCategory: !!response_category,
            hasCampaign: !!response_item_campaign,
            hasStore: !!response_store,
            hasTimestamp: !!response_timestamp,
          });

          let shouldRevalidate = false;
          if (response_timestamp) {
            const timestampData = await response_timestamp.json();
            const cacheAge = Date.now() - timestampData.timestamp;
            shouldRevalidate = cacheAge > 3600000;
            console.log("Cache age check:", { cacheAge, shouldRevalidate });
          }

          if (
            response_product &&
            response_category &&
            response_item_campaign &&
            response_store
          ) {
            const [
              data_product,
              data_category,
              data_item_campaign,
              data_store,
            ] = await Promise.all([
              response_product.json(),
              response_category.json(),
              response_item_campaign.json(),
              response_store.json(),
            ]);
            console.log("Loaded from cache:", {
              products: data_product,
              categories: data_category,
              campaigns: data_item_campaign,
              stores: data_store,
            });

            setProducts(data_product);
            setCategoryProductList(data_category);
            setItemCampaignList(data_item_campaign);
            setStores(data_store);
            setIsLoading(false);
          }

          if (
            !response_product ||
            !response_category ||
            !response_item_campaign ||
            !response_store ||
            shouldRevalidate
          ) {
            console.log(
              "Fetching fresh data due to cache miss or revalidation"
            );
            const [
              data_product,
              data_category_product,
              data_item_campaign,
              data_store,
            ] = await Promise.all([
              fetchProducts(),
              fetchCategoryProduct(),
              fetchItemCampaign(),
              getStores(),
            ]);

            console.log("Updating cache with fresh data");
            const cache_product = new Response(JSON.stringify(data_product));
            const cache_category = new Response(
              JSON.stringify(data_category_product)
            );
            const cache_item_campaign = new Response(
              JSON.stringify(data_item_campaign)
            );
            const cache_store = new Response(JSON.stringify(data_store));
            const cache_timestamp = new Response(
              JSON.stringify({ timestamp: Date.now() })
            );

            await Promise.all([
              cache.put(`product_list${id_store}`, cache_product),
              cache.put(`category_product${id_store}`, cache_category),
              cache.put(`item_campaign${id_store}`, cache_item_campaign),
              cache.put(`store${id_store}`, cache_store),
              cache.put(`cache_timestamp${id_store}`, cache_timestamp),
            ]);

            setIsLoading(false);

            if (
              !response_product ||
              !response_category ||
              !response_item_campaign ||
              !response_store
            ) {
              console.log("Setting fresh data to state");
              setProducts(data_product);
              setCategoryProductList(data_category_product);
              setItemCampaignList(data_item_campaign);
              setStores(data_store);
              setIsLoading(false);
            }
          }
        } catch (error) {
          console.error("Error in cek_product:", error);
          setIsLoading(false);
        }
      } else {
        console.warn("Missing one or more query parameters!", {
          id_store,
          id_company,
        });
        setIsLoading(false);
      }
    };

    console.log("Calling cek_product");
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

  useEffect(() => {
    if (!stores?.decorationDetails) return;

    const { primary, secondary, tertiary, danger } = stores.decorationDetails;
    document.documentElement.style.setProperty("--bg-primary", primary);
    document.documentElement.style.setProperty("--bg-secondary", secondary);
    document.documentElement.style.setProperty("--bg-tertiary", tertiary);
    document.documentElement.style.setProperty("--bg-danger", danger);
  }, [stores]);

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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProductList = products.filter((product) =>
    product.name_product.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <ImageWithFallback
              onError={"https://placehold.co/100x100"}
              src={stores?.decorationDetails?.motive || "/default-motive.png"}
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
          <ImageWithFallback
            onError={"https://placehold.co/100x100"}
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
          <input
            type="text"
            placeholder="Cari Product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 pr-4 py-2 border border-gray-300 rounded-md w-full max-w-xs bg-white"
          />
          <h2 className="font-bold text-4xl mb-4">Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProductList.length === 0 ? (
              <p>Produk Tidak Ada</p>
            ) : (
              filteredProductList.map((product) => {
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
        <ImageWithFallback
          onError={"https://placehold.co/100x100"}
          src={
            stores.decorationDetails.footer_motive ||
            "/default-footer-motive.png"
          }
          width={400}
          height={100}
          className="absolute rounded-md w-full"
          alt="FOOTER MOTIVE"
        />
      </div>
      <footer className="w-full mt-auto z-40">
        <Footer
          logo={"/icon_kelontong.svg"}
          keterangan="Experience the epitome of dependable and secure shopping through Toko Kelontong, a premier marketplace for daily necessities that sets new benchmarks in reliability and quality standards."
          address="Jl. Palagan Tentara Pelajar Blok B No.6 Sariharjo, Ngaglik, Tambak Rejo, Sariharjo, Kec. Ngaglik, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55581"
          phone="+62 822-2506-8682"
        />
      </footer>
      <Modal
        width="large"
        isOpen={isModalOpen}
        onClose={closeModal}
        title={"PRODUK"}
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-64 max-h-64">
            <div className="w-full max-h-64 rounded-xl flex justify-center p-3 border border-slate-300">
              <ImageWithFallback
                onError={"https://placehold.co/100x100"}
                src={selectedProduct?.image}
                alt={selectedProduct?.name_product}
                width={100}
                height={100}
                className="object-cover w-full"
              />
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">
                {selectedProduct?.name_product}
              </h2>
              <p className="text-gray-600 text-lg">
                {selectedProduct?.deskripsi}
              </p>

              {/* Category & Stock */}
              <div className="flex flex-wrap gap-3 text-sm">
                <span
                  className={`px-4 py-1 rounded-full font-medium ${
                    selectedProduct?.id_stock?.amount -
                      selectedProduct?.orderQty >
                    0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  Stok:{" "}
                  {selectedProduct?.id_stock?.amount -
                    selectedProduct?.orderQty}
                </span>
                <span
                  className={`px-4 py-1 rounded-full font-medium ${
                    selectedProduct?.id_stock?.amount -
                      selectedProduct?.orderQty >
                    0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {selectedProduct?.id_stock?.amount -
                    selectedProduct?.orderQty >
                  0
                    ? "TERSEDIA"
                    : "HABIS"}
                </span>
              </div>

              {/* Pricing */}
              <div className="flex items-center gap-4">
                <p className="relative text-xl font-semibold text-gray-800">
                  {selectedProduct?.discount > 0 && (
                    <span className="absolute text-red-500 text-sm line-through -top-4 -left-3">
                      Rp{" "}
                      {Number(
                        (
                          selectedProduct?.sell_price *
                          (1 - selectedProduct?.discount)
                        ).toFixed(0)
                      ).toLocaleString("id-ID")}
                    </span>
                  )}
                  <span className="text-2xl font-bold">
                    Rp {selectedProduct?.sell_price.toLocaleString("id-ID")}
                  </span>
                </p>
                {selectedProduct?.discount > 0 && (
                  <span className="text-sm font-medium text-red-600 bg-red-100 px-3 py-1 rounded-full">
                    Diskon: {selectedProduct?.discount * 100}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Extras & Sizes - Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Extras */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                Varian
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedProduct?.id_extras &&
                selectedProduct?.id_extras.extrasDetails.length > 0 ? (
                  selectedProduct?.id_extras?.extrasDetails.map((extra) => (
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
                  ))
                ) : (
                  <span className="text-gray-700">Belum Tersedia</span>
                )}
              </div>
            </div>

            {/* Sizes */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                Sizes
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedProduct?.id_size &&
                selectedProduct?.id_size.sizeDetails.length > 0 ? (
                  selectedProduct?.id_size?.sizeDetails.map((size) => (
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
                  ))
                ) : (
                  <span className="text-gray-700">Belum Tersedia</span>
                )}
              </div>
            </div>
          </div>
          {/* Kontrol Jumlah Produk */}
          <div className="flex items-center justify-center mt-4">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="py-2 px-3 border border-black rounded-md"
            >
              <FaMinus />
            </button>
            <input
              type="number"
              min={1}
              step={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="mx-4 w-16 text-center bg-transparent border-none focus:outline-none focus:border-b focus:border-black spinner-none"
            />
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="py-2 px-3 border border-black rounded-md"
              disabled={quantity >= selectedProduct?.id_stock?.amount}
            >
              <FaPlus />
            </button>
          </div>

          {/* Peringatan Stok */}
          {quantity >
            (selectedProduct?.id_stock?.amount || 0) -
              (selectedProduct?.orderQty || 0) && (
            <p className="text-red-500 mt-2">
              Stok produk ini hanya{" "}
              {(selectedProduct?.id_stock?.amount || 0) -
                (selectedProduct?.orderQty || 0)}
            </p>
          )}

          {/* Tombol Tambah ke Keranjang */}
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
      ;
    </div>
  );
}
