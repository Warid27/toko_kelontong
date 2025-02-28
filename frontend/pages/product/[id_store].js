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
  const [categoryProductList, setCategoryProductList] = useState([]);
  const router = useRouter();
  const [stores, setStores] = useState([]);

  useEffect(() => {
    if (router.isReady) {
      setQueryReady(true);
    }
  }, [router.isReady]);

  useEffect(() => {
    if (!queryReady) return;

    const { id_store, id_company, id_category_product } = router.query;

    const fetchProducts = async () => {
      setIsLoading(true);

      try {
        const response = await client.post("/product/listproduct", {
          id_store: id_store,
          id_company: id_company,
          id_category_product: id_category_product,
          status: 0, // 0 = Active, 1 = Inactive
          params: "order",
        });
        console.log("RESP", response.data);
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id_store && id_company) {
      fetchProducts();
    } else {
      console.warn("Missing one or more query parameters!");
      setIsLoading(false);
    }
  }, [queryReady, router.query]);

  useEffect(() => {
    const fetchItemCampaign = async () => {
      try {
        const response = await client.post(
          "/itemcampaign/listitemcampaigns",
          {}
        );
        const data = response.data;

        // Validate that the response is an array
        if (!Array.isArray(data)) {
          console.error(
            "Unexpected data format from /itemcampaign/listitemcampaign:",
            data
          );
          setItemCampaignList([]);
        } else {
          setItemCampaignList(data);
        }
      } catch (error) {
        console.error("Error fetching item campaign:", error);
        setItemCampaignList([]);
      }
    };
    fetchItemCampaign();
  }, []);
  useEffect(() => {
    const fetchCategoryProduct = async () => {
      try {
        const response = await client.post("/category/listcategories", {});
        const data = response.data;

        // Validate that the response is an array
        if (!Array.isArray(data)) {
          console.error(
            "Unexpected data format from /category/listcategories:",
            data
          );
          setCategoryProductList([]);
        } else {
          setCategoryProductList(data);
        }
      } catch (error) {
        console.error("Error fetching item campaign:", error);
        setCategoryProductList([]);
      }
    };
    fetchCategoryProduct();
  }, []);

  useEffect(() => {
    const getStores = async () => {
      try {
        const token = localStorage.getItem("token");
        const { id_store, id_company, id_category_product } = router.query;

        if (!id_store) {
          console.error("id_store is missing in query");
          setIsLoading(false);
          return;
        }
        const response = await client.post(
          "/store/getstore",
          { id: id_store },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Set the fetched stores into state
        setStores(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching stores:", error);
        setIsLoading(false);
      }
    };

    getStores();
  }, []);

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
    <div className="bg-[#F7F7F7] min-h-screen">
      <Topbar onCartUpdate={handleCartUpdate} />
      <div className="p-10">
        <div className="flex justify-center max-h-[55vh] overflow-hidden relative">
          <Image
            src={stores.header}
            alt="header"
            layout="responsive"
            width={100}
            height={100}
            className="w-full  object-fill"
          />
        </div>
        <div className="justify-items-start mt-10 space-x-4 flex">
          {categoryProductList.map((cpl) => {
            const { id_store, id_company } = router.query;

            return (
              <Link
                key={cpl._id}
                href={`/product/${id_store}?id_company=${id_company}&id_category_product=${cpl._id}`}
                className="bg-[#FEE66B] hover:bg-[#ebd35c] p-3 rounded-md flex-1 font-semibold"
              >
                <button className="flex items-center justify-center w-full h-full">
                  {cpl.name_category}
                </button>
              </Link>
            );
          })}
        </div>
        {/* <button className="bg-[#FFA461] hover:bg-[#e68e4f] p-3 rounded-md font-semibold flex-1">
            Promo
          </button> */}

        <div className="mt-10 space-y-6">
          <h2 className="font-bold text-4xl mb-4">Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => {
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
                    image={product.image || "https://placehold.co/100x100"}
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
            })}
          </div>
        </div>
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
