import React, { useEffect, useState } from "react";
import moment from "moment";
import Image from "next/image";
import Swal from "sweetalert2";

// Icons
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import { VscTrash } from "react-icons/vsc";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { CgNotes } from "react-icons/cg";

// Components
import { SubmitButton, CloseButton } from "@/components/form/button";
import { Modal } from "@/components/Modal";
import Header from "@/components/section/header";
import Card from "@/components/Card";
import Loading from "@/components/loading";

// API Functions
import { fetchProductsList, fetchGetProducts } from "@/libs/fetching/product";
import { fetchPembelianAdd } from "@/libs/fetching/pembelian";
import client from "@/libs/axios";
import { toast } from "react-toastify";

const Pembelian = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [pembelianItems, setPembelianItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedExtra, setSelectedExtra] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [infoBuyer, setInfoBuyer] = useState({ keterangan: "" });
  const [searchQuery, setSearchQuery] = useState("");

  const token = localStorage.getItem("token");
  const id_store = localStorage.getItem("id_store") || null;
  const id_company = localStorage.getItem("id_company") || null;

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productData = await fetchProductsList(id_store, id_company, null);
        setProducts(productData);
        const storedItems = JSON.parse(
          localStorage.getItem("pembelianItems") || "[]"
        );
        setPembelianItems(storedItems);
      } catch (error) {
        toast.error("Failed to load products");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Sync infoBuyer with pembelianItems
  useEffect(() => {
    if (pembelianItems[0]?.informasi) {
      setInfoBuyer({
        keterangan: pembelianItems[0].informasi.keterangan || "",
      });
    }
  }, [pembelianItems]);

  // Modal control functions
  const modalOpen = (type, bool) => {
    const setters = {
      add: setIsModalOpen,
      info: setIsInfoModalOpen,
      note: setIsNoteModalOpen,
    };
    setters[type]?.(bool);
  };

  // Handle product selection
  const handleCardClick = async (product) => {
    try {
      const response = await fetchGetProducts(product._id, "all");
      setSelectedProduct(response.data);
      setQuantity(1);
      setSelectedExtra(null);
      setSelectedSize(null);
      modalOpen("add", false);
      modalOpen("info", true);
    } catch (error) {
      toast.error("Failed to fetch product details");
    }
  };

  // Handle quantity change
  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedItems = [...pembelianItems];
    updatedItems[index].quantity = newQuantity;
    setPembelianItems(updatedItems);
    localStorage.setItem("pembelianItems", JSON.stringify(updatedItems));
  };

  // Handle item deletion
  const handleDelete = async (index) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This item will be removed from the cart!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      const updatedItems = pembelianItems.filter((_, i) => i !== index);
      setPembelianItems(updatedItems);
      localStorage.setItem("pembelianItems", JSON.stringify(updatedItems));
      toast.success("Item removed from cart");
    }
  };

  // Handle adding item to cart
  const addToCart = () => {
    if (quantity < 1) return;

    const existingIndex = pembelianItems.findIndex(
      (item) =>
        item.product.id === selectedProduct._id &&
        item.selectedExtra?._id === selectedExtra &&
        item.selectedSize?._id === selectedSize
    );

    let updatedItems = [...pembelianItems];
    if (existingIndex !== -1) {
      updatedItems[existingIndex].quantity += quantity;
    } else {
      const newItem = {
        product: {
          id: selectedProduct._id,
          code: selectedProduct.product_code,
          id_company: selectedProduct.id_company,
          id_store: selectedProduct.id_store,
          name: selectedProduct.name_product,
          image: selectedProduct.image,
          buy_price: selectedProduct.buy_price,
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
      updatedItems.push(newItem);
    }

    setPembelianItems(updatedItems);
    localStorage.setItem("pembelianItems", JSON.stringify(updatedItems));
    modalOpen("info", false);
    toast.success("Item added to cart");
  };

  // Handle purchase submission
  const handlePembelian = async (e) => {
    e.preventDefault();
    if (pembelianItems.length === 0) {
      toast.error("No items to purchase");
      return;
    }

    try {
      const totalQty = pembelianItems.reduce(
        (total, item) => total + item.quantity,
        0
      );
      const totalPrice = pembelianItems.reduce(
        (total, item) => total + item.product.buy_price * item.quantity,
        0
      );
      const pembelianCode = `PEM/${moment().format("YYYYMMDDHHmmss")}`;
      const id_user = localStorage.getItem("id_user") || "UNKNOWN_USER";

      const pembelianData = {
        no: pembelianCode,
        id_user,
        id_payment_type: "67ae07107f2282a509936fb7",
        status: 1,
        total_price: totalPrice,
        total_quantity: totalQty,
        total_discount: 0,
        keterangan: infoBuyer.keterangan || "",
        total_number_item: pembelianItems.length,
        pembelianDetails: pembelianItems.map((item) => ({
          id_product: item.product.id,
          id_company: item.product.id_company,
          id_store: item.product.id_store,
          name: item.product.name,
          product_code: item.product.code,
          item_price: Number(item.product.buy_price),
          item_quantity: item.quantity,
          item_discount: 0,
        })),
      };

      const response = await fetchPembelianAdd(pembelianData, token);
      if (response.status === 201) {
        for (const item of pembelianItems) {
          await client.put(
            "/api/stock",
            {
              amount: item.quantity,
              params: "in",
              id_product: item.product.id,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
        clearPembelian();
        toast.success("Purchase completed successfully");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to complete purchase"
      );
    }
  };

  // Clear cart
  const clearPembelian = () => {
    setPembelianItems([]);
    setInfoBuyer({ keterangan: "" });
    localStorage.setItem("pembelianItems", JSON.stringify([]));
  };

  // Handle note input change
  const handleNoteChange = (e) => {
    const { name, value } = e.target;
    setInfoBuyer((prev) => ({ ...prev, [name]: value }));
  };

  const filteredProducts = products.filter((product) =>
    product.name_product.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <Loading />;

  return (
    <div className="w-full h-screen pt-16 relative bg-[#F7F7F7]">
      <Header
        title="Beli Stock"
        subtitle="Tambah Stock Pembelian"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        modalOpen={modalOpen}
        isSearch={true}
        isAdd={true}
      />

      <div className="p-4 mx-auto max-w-4xl">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Pesanan</h2>
          </div>
          {pembelianItems.length === 0 ? (
            <p>Keranjang Anda kosong.</p>
          ) : (
            <ul className="space-y-4">
              {pembelianItems.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center border p-4 rounded-lg bg-white shadow-md"
                >
                  <Image
                    src={item.product.image || "https://placehold.co/100x100"}
                    alt={item.product.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover rounded-lg mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {item.product.name}
                    </h3>
                    <div className="flex">
                      {item.selectedSize?.name && (
                        <p className="text-sm">
                          {item.selectedSize.name}
                          {item.selectedExtra?.name && ","}
                        </p>
                      )}
                      {item.selectedExtra?.name && (
                        <p className="text-sm ml-1">
                          {item.selectedExtra.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <p className="font-semibold mr-4">
                      Rp.{" "}
                      {new Intl.NumberFormat("id-ID").format(
                        item.product.buy_price
                      )}
                    </p>
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            index,
                            Number(e.target.value) || 1
                          )
                        }
                        min="1"
                        className="text-center bg-transparent text-lg w-8 outline-none border-none"
                      />
                      <div className="flex flex-col items-center ml-2 -space-y-2.5">
                        <button
                          onClick={() =>
                            handleQuantityChange(index, item.quantity + 1)
                          }
                          className="text-lg bg-transparent p--4 leading-none"
                        >
                          <TiArrowSortedUp />
                        </button>
                        <button
                          onClick={() =>
                            handleQuantityChange(index, item.quantity - 1)
                          }
                          className="text-lg bg-transparent p--4 leading-none"
                        >
                          <TiArrowSortedDown />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(index)}
                      className="ml-4"
                    >
                      <VscTrash className="w-6 h-6" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mb-6">
          <button
            className={`${
              infoBuyer.keterangan ? "bg-[#FDDC05]" : "bg-[#D3D3D3]"
            } text-black font-semibold rounded-full px-4 py-2 flex items-center space-x-2 hover:bg-[#FDDC05] transition-all duration-200 shadow-lg`}
            onClick={() => modalOpen("note", true)}
          >
            <CgNotes className="w-5 h-5" /> <span>+ Tambah Catatan</span>
          </button>
          {infoBuyer.keterangan && (
            <p className="text-gray-500 text-sm mt-2">Catatan terisi</p>
          )}
        </div>

        <div className="text-right">
          <p className="text-lg font-bold mb-4">
            Sub Total: Rp.{" "}
            {new Intl.NumberFormat("id-ID").format(
              pembelianItems.reduce(
                (total, item) => total + item.quantity * item.product.buy_price,
                0
              )
            )}
          </p>
          <div className="flex justify-end">
            <button
              onClick={handlePembelian}
              className="py-2 px-4 rounded-lg w-1/2 font-bold bg-[#FDDC05] text-black"
            >
              Bayar
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => modalOpen("add", false)}
        title="Tambah Pesanan"
        width="large"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.length === 0 ? (
            <h1 className="col-span-full text-center">
              Produk tidak ditemukan!
            </h1>
          ) : (
            filteredProducts.map((product) => (
              <div key={product._id} onClick={() => handleCardClick(product)}>
                <Card
                  lebar={50}
                  tinggi={50}
                  image={product.image || "https://placehold.co/100x100"}
                  nama={product.name_product}
                  harga={`Rp ${new Intl.NumberFormat("id-ID").format(
                    product.buy_price
                  )}`}
                />
              </div>
            ))
          )}
        </div>
      </Modal>

      <Modal
        isOpen={isInfoModalOpen}
        onClose={() => modalOpen("info", false)}
        title={selectedProduct?.name_product || "Product Details"}
        width="large"
      >
        <div>
          <Image
            src={selectedProduct?.image || "https://placehold.co/100x100"}
            alt={selectedProduct?.name_product}
            width={500}
            height={550}
            className="w-[500px] h-[550px] mb-4 object-cover"
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

          <div className="flex items-center place-content-center mt-4">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="py-2 px-3 border border-black rounded-md"
            >
              <FaMinus />
            </button>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value) || 1)}
              className="mx-4 w-16 text-center bg-transparent border-none focus:outline-none"
            />
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="py-2 px-3 border border-black rounded-md"
            >
              <FaPlus />
            </button>
          </div>

          <div className="flex justify-end mt-5">
            <CloseButton onClick={() => modalOpen("info", false)} />
            <SubmitButton onClick={addToCart} label="Tambah ke Keranjang" />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => modalOpen("note", false)}
        title="Catatan Pemesanan"
        width="large"
      >
        <textarea
          name="keterangan"
          value={infoBuyer.keterangan}
          onChange={handleNoteChange}
          className="bg-white shadow-md border p-4 h-20 rounded-lg w-full"
          placeholder="Belum menuliskan keterangan"
        />
        <div className="flex justify-end mt-5">
          <CloseButton onClick={() => modalOpen("note", false)} />
          <SubmitButton
            onClick={() => modalOpen("note", false)}
            label="Simpan"
          />
        </div>
      </Modal>
    </div>
  );
};

export default Pembelian;
