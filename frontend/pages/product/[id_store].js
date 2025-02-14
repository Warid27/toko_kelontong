import React, { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import Topbar from "@/components/Topbar";
import Image from "next/image";
import Card from "@/components/Card";
import client from "@/libs/axios";
import { Modal } from "@/components/Modal";
import { useRouter } from "next/router";
import { FaMinus, FaPlus } from "react-icons/fa6";
import Cookies from "js-cookie";
import Link from "next/link";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [queryReady, setQueryReady] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedExtra, setSelectedExtra] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartUpdate, setCartUpdated] = useState(false);

  const router = useRouter();
  useEffect(() => {
    if (router.isReady) {
      setQueryReady(true);
    }
  }, [router.isReady]);

  useEffect(() => {
    if (!queryReady) return;

    const { id_store, id_company, id_category_product } = router.query;
    // ini dia id_store dan id_company
    // console.log("Parsed Query Parameters:", {
    //   id_store,
    //   id_company,
    //   id_category_product,
    // });

    const fetchProducts = async () => {
      setIsLoading(true);

      try {
        const response = await client.post("/product/listproduct", {
          id_store: id_store,
          id_company: id_company,
          id_category_product: id_category_product,
          status: 0, // 0 = Active, 1 = Inactive
        });
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

  const handleCardClick = async (product) => {
    try {
      const response = await client.post("product/getproduct", {
        id: product._id,
      });
      setSelectedProduct(response.data); // Set the selected product with fetched data
      setIsModalOpen(true); // Open the modal
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
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
        <div className="flex justify-center">
          <Image
            src="/Header.svg"
            alt="header"
            layout="responsive"
            width={100}
            height={100}
            className="w-full"
          />
        </div>
        <div className="justify-items-start mt-10 space-x-4 flex">
          <button className="bg-[#FFA461] hover:bg-[#e68e4f] p-3 rounded-md font-semibold flex-1">
            Promo
          </button>
          <Link
            href="/product/1?id_company=1&id_category_product=2"
            className="bg-[#FEE66B] hover:bg-[#ebd35c] p-3 rounded-md flex-1 font-semibold"
          >
            <button className="flex items-center justify-center w-full h-full">
              Minuman
            </button>
          </Link>
          <Link
            href="/product/1?id_company=1&id_category_product=1"
            className="bg-[#F7E7C3] hover:bg-[#e4d4b0] p-3 rounded-md flex-1 font-semibold"
          >
            <button className="flex items-center justify-center w-full h-full">
              Makanan
            </button>
          </Link>
          <Link
            href="/product/1?id_company=1&id_category_product=3"
            className="bg-[#DC9A78] hover:bg-[#d39272] p-3 rounded-md flex-1 font-semibold"
          >
            <button className="flex items-center justify-center w-full h-full">
              Snack
            </button>
          </Link>
        </div>
        <div className="mt-10 space-y-6">
          <h2 className="font-bold text-4xl mb-4">Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product._id} onClick={() => handleCardClick(product)}>
                <Card
                  image={product.image || "https://placehold.co/100x100"}
                  nama={product.name_product}
                  harga={
                    `Rp ${new Intl.NumberFormat("id-ID").format(
                      product.sell_price
                    )}`
                    // product.price_before !== product.price_after ? (
                    //   <div>
                    //     <span className="line-through text-red-500">
                    //       Rp {product.price_before}
                    //     </span>
                    //     <span className="ml-2">Rp {product.price_after}</span>
                    //   </div>
                    // ) : (
                    //   <span>Rp {product.price_after}</span>
                    // )
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />

      {isModalOpen && (
        <Modal onClose={closeModal}>
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
              <span className="mx-4">{quantity}</span>{" "}
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="py-2 px-3 border border-black rounded-md"
              >
                <FaPlus />
              </button>
            </div>

            <button
              onClick={() => {
                const cartItems = JSON.parse(Cookies.get("cartItems") || "[]");

                // console.log("COOKIES BEFORE:", cartItems);

                // Cek apakah item dengan extras & size yang sama sudah ada
                const existingIndex = cartItems.findIndex(
                  (item) =>
                    // console.log(item.product._id),
                    item.product.id === selectedProduct._id &&
                    item.selectedExtra?._id === selectedExtra &&
                    item.selectedSize?._id === selectedSize
                );

                if (existingIndex !== -1) {
                  // Jika produk dengan extras dan size yang sama sudah ada, tambahkan jumlahnya
                  cartItems[existingIndex].quantity += quantity;
                } else {
                  // Jika belum ada, tambahkan sebagai item baru
                  const newItem = {
                    product: {
                      // ...prevProduct  ini bikin ngebug sialannnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
                      id: selectedProduct._id,
                      name: selectedProduct.name_product,
                      image: selectedProduct.image,
                      price: selectedProduct.sell_price,
                    },
                    quantity,
                    selectedExtra: selectedExtra
                      ? {
                          _id: selectedExtra,
                          name: selectedProduct?.id_extras?.extrasDetails.find(
                            (extra) => extra._id === selectedExtra
                          )?.name,
                        }
                      : null,
                    selectedSize: selectedSize
                      ? {
                          _id: selectedSize,
                          name: selectedProduct?.id_size?.sizeDetails.find(
                            (size) => size._id === selectedSize
                          )?.name,
                        }
                      : null,
                  };
                  // console.log("YUDAAA", newItem.selectedExtra);
                  cartItems.push(newItem);
                  // console.log("item barunya", newItem);
                }

                Cookies.set("cartItems", JSON.stringify(cartItems), {
                  expires: 7,
                });
                // console.log("Menambahkan ke keranjang:", cartItems);
                // console.log("COOKIESSSS:", Cookies.get("cartItems"));
                closeModal();
                handleCartUpdate();
              }}
              className={`mt-4 w-full p-2 rounded-md ${
                quantity === 0 ? "bg-gray-400" : "bg-green-500 text-white"
              }`}
              disabled={quantity === 0}
            >
              Tambah ke Keranjang
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
