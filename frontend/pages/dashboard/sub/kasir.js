import React, { useEffect, useState } from "react";
import moment from "moment";
import Image from "next/image";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

// Icons
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import { VscTrash } from "react-icons/vsc";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { CgNotes } from "react-icons/cg";

// Components
import Card from "@/components/Card";
import { Modal } from "@/components/Modal";
import { SubmitButton, CloseButton, AddButton } from "@/components/form/button";
import Header from "@/components/section/header";
import Loading from "@/components/loading";
import { AddMenu } from "@/components/form/menu";
import PaymentMethod from "@/components/form/payment/paymentMethod";

// Fetch Functions
import { fetchProductsList } from "@/libs/fetching/product";
import { fetchPaymentList } from "@/libs/fetching/payment";
import { fetchTableList } from "@/libs/fetching/table";
import { fetchItemCampaignList } from "@/libs/fetching/itemCampaign";
import { addSales } from "@/libs/fetching/sales";
import { updateStock } from "@/libs/fetching/stock";
import { fetchSalesCampaignList } from "@/libs/fetching/salesCampaign";
import { fetchOrderList, updateOrder } from "@/libs/fetching/order";
import { tokenDecoded } from "@/utils/tokenDecoded";

const Kasir = () => {
  const [products, setProducts] = useState([]);
  const [tableList, setTableList] = useState([]);
  const [orderList, setOrderList] = useState([]);
  const [itemCampaignList, setItemCampaignList] = useState([]);
  const [salesCampaignList, setSalesCampaignList] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [kasirItems, setKasirItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedExtra, setSelectedExtra] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [salesDiscount, setSalesDiscount] = useState(null);
  const [idSalesDiscount, setIdSalesDiscount] = useState(null);
  const [payments, setPayments] = useState([]);
  const [infoBuyyer, setInfoBuyyer] = useState({
    nama: "",
    keterangan: "",
    status: 1,
  });
  const [promo, setPromo] = useState({ nama: "" });
  const [expandedPayments, setExpandedPayments] = useState({});
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [tableNumber, setTableNumber] = useState({ nomor: "" });
  const [searchQuery, setSearchQuery] = useState("");

  const tax = 0.12;
  const id_store = localStorage.getItem("id_store");
  const id_company = localStorage.getItem("id_company");
  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          productData,
          paymentData,
          tableData,
          itemCampaignData,
          salesCampaignData,
          orderData,
        ] = await Promise.all([
          fetchProductsList(id_store, id_company, null, "order"),
          fetchPaymentList(),
          fetchTableList(),
          fetchItemCampaignList(),
          fetchSalesCampaignList(),
          fetchOrderList(),
        ]);

        setProducts(productData);
        setPayments(
          paymentData.flatMap((pt) =>
            pt.paymentName.map((pn) => ({
              ...pn,
              payment_method: pt.payment_method,
            }))
          )
        );
        setTableList(tableData);
        setItemCampaignList(itemCampaignData);
        setSalesCampaignList(salesCampaignData);
        setOrderList(orderData);

        const storedItems = JSON.parse(
          localStorage.getItem("kasirItems") || "[]"
        );
        setKasirItems(storedItems);
      } catch (error) {
        toast.error("Failed to load initial data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Sync infoBuyyer with kasirItems
  useEffect(() => {
    if (kasirItems[0]?.informasi) {
      setInfoBuyyer({
        nama: kasirItems[0].informasi.person_name || "",
        keterangan: kasirItems[0].informasi.keterangan || "",
        status: kasirItems[0].informasi.status || 1,
      });
    }
  }, [kasirItems]);

  // Modal control
  const modalOpen = (type, bool) => {
    const setters = {
      add: setIsModalOpen,
      info: setIsInfoModalOpen,
      note: setIsNoteModalOpen,
      pay: setIsPayModalOpen,
    };
    setters[type]?.(bool);
  };

  // Handle product selection
  const handleCardClick = async (product) => {
    const selected = products.find((p) => p._id === product._id);
    if (selected) {
      setSelectedProduct(selected);
      setQuantity(1);
      setSelectedExtra(null);
      setSelectedSize(null);
      modalOpen("add", false);
      modalOpen("info", true);
    } else {
      toast.error("Product not found");
    }
  };

  // Handle quantity change
  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedItems = [...kasirItems];
    updatedItems[index].quantity = newQuantity;
    setKasirItems(updatedItems);
    localStorage.setItem("kasirItems", JSON.stringify(updatedItems));
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
      const updatedItems = kasirItems.filter((_, i) => i !== index);
      setKasirItems(updatedItems);
      localStorage.setItem("kasirItems", JSON.stringify(updatedItems));
      if (!updatedItems[0]?.informasi) {
        setInfoBuyyer({ nama: "", keterangan: "", status: 1 });
      }
      toast.success("Item removed from cart");
    }
  };

  // Add to cart
  const addToCart = () => {
    if (quantity < 1) return toast.error("Quantity cannot be less than 1!");

    const existingIndex = kasirItems.findIndex(
      (item) =>
        item.product.id === selectedProduct._id &&
        item.selectedExtra?._id === selectedExtra &&
        item.selectedSize?._id === selectedSize
    );

    let updatedItems = [...kasirItems];
    if (existingIndex !== -1) {
      updatedItems[existingIndex].quantity += quantity;
    } else {
      const today = new Date().toISOString().split("T")[0];
      const campaign = itemCampaignList.find(
        (c) =>
          c._id === selectedProduct.id_item_campaign &&
          c.start_date <= today &&
          c.end_date >= today
      );
      const discountValue = campaign ? campaign.value : 0;

      const newItem = {
        product: {
          id: selectedProduct._id,
          code: selectedProduct.product_code,
          id_company: selectedProduct.id_company,
          id_store: selectedProduct.id_store,
          id_item_campaign: selectedProduct.id_item_campaign || null,
          name: selectedProduct.name_product,
          image: selectedProduct.image,
          price: selectedProduct.sell_price,
          priceAfterDiscount: selectedProduct.sell_price * (1 - discountValue),
          amount: selectedProduct?.id_stock?.amount,
          orderQty: selectedProduct.orderQty,
        },
        quantity,
        selectedExtra: selectedExtra
          ? {
              _id: selectedExtra,
              name: selectedProduct?.id_extras?.extrasDetails.find(
                (e) => e._id === selectedExtra
              )?.name,
            }
          : null,
        selectedSize: selectedSize
          ? {
              _id: selectedSize,
              name: selectedProduct?.id_size?.sizeDetails.find(
                (s) => s._id === selectedSize
              )?.name,
            }
          : null,
      };

      const infoItem = kasirItems.find((ki) => ki.informasi);
      if (infoItem) {
        newItem.informasi = { ...infoItem.informasi };
      }

      updatedItems.push(newItem);
    }

    setKasirItems(updatedItems);
    localStorage.setItem("kasirItems", JSON.stringify(updatedItems));
    modalOpen("info", false);
    toast.success("Item added to cart");
  };

  // Handle sales submission
  const handleSales = async (e) => {
    e.preventDefault();
    if (kasirItems.length === 0) return toast.error("No items to process");
    if (!selectedMethod) return toast.error("Please select a payment method");

    try {
      const insufficientItems = kasirItems.filter((item) => {
        const availableStock =
          (item.product.amount || 0) -
          (item.product.orderQty || 0) +
          (item.qty_before || 0);
        return item.quantity > availableStock;
      });

      if (insufficientItems.length > 0) {
        const errorMessage = `
          <ul style="margin: 10px 0; padding-left: 20px; color: #ff4d4d;">
            ${insufficientItems
              .map(
                (item) => `
                <li>
                  <strong>${item.product.name}:</strong> Only 
                  <strong>${
                    item.product.amount - (item.product.orderQty || 0)
                  }</strong> 
                  available, requested <strong>${item.quantity}</strong>.
                </li>`
              )
              .join("")}
          </ul>`;

        return toast.error("Insufficient Stock!", {
          description: errorMessage,
        });
      }

      const totalQty = kasirItems.reduce(
        (total, item) => total + item.quantity,
        0
      );
      const totalPrice = kasirItems.reduce(
        (total, item) =>
          total + item.product.priceAfterDiscount * item.quantity,
        0
      );
      const totalPriceWithTax = Math.max(
        totalPrice * (1 - (salesDiscount || 0)) * (1 + tax),
        0
      );
      const salesCode = `INV/${moment().format("DD-MM-YY HH:mm:ss")}`;

      const userData = tokenDecoded();
      const salesData = {
        no: salesCode,
        id_user: userData.id,
        id_order: kasirItems[0]?.informasi?.id_order || null,
        id_sales_campaign: idSalesDiscount,
        id_payment_type: selectedMethod._id,
        tax: tax,
        name: infoBuyyer.nama,
        status: infoBuyyer.status,
        keterangan: infoBuyyer.keterangan,
        total_price: totalPriceWithTax,
        total_quantity: totalQty,
        total_discount: salesDiscount || 0,
        total_number_item: kasirItems.length,
        salesDetails: kasirItems.map((item) => ({
          id_product: item.product.id,
          id_extras: item.selectedExtra?._id || null,
          id_size: item.selectedSize?._id || null,
          id_company: item.product.id_company,
          id_store: item.product.id_store,
          id_item_campaign: item.product.id_item_campaign,
          name: item.product.name,
          product_code: item.product.code,
          item_price: Number(item.product.priceAfterDiscount),
          item_quantity: item.quantity,
          item_discount: 0,
        })),
      };

      const response = await addSales(salesData);
      if (response.status === 201) {
        for (const item of kasirItems) {
          await updateStock({
            amount: item.quantity,
            params: "out",
            id_product: item.product.id,
          });
        }

        if (kasirItems[0]?.informasi?.id_order) {
          await updateOrder({ status: 1 }, kasirItems[0].informasi.id_order);
        }

        clearKasir();
        toast.success("Payment completed successfully!");
      }
    } catch (error) {
      toast.error(error.message || "Failed to complete sale");
    }
  };

  // Clear cart
  const clearKasir = () => {
    modalOpen("pay", false);
    setKasirItems([]);
    setInfoBuyyer({ nama: "", keterangan: "", status: 1 });
    setSalesDiscount(null);
    setIdSalesDiscount(null);
    setPromo({ nama: "" });
    setTableNumber({ nomor: "" });
    setSelectedMethod(null);
    localStorage.setItem("kasirItems", JSON.stringify([]));
  };

  // Handle input changes
  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setInfoBuyyer((prev) => ({ ...prev, [name]: value }));
  };
  const tableHandleChange = (e) => {
    setTableNumber({
      ...tableNumber,
      nomor: e.target.value,
    });
  };
  const handlePromoChange = (e) => {
    setPromo({ nama: e.target.value });
  };

  const handleSubmitPromo = async (e) => {
    e.preventDefault();
    const campaign = salesCampaignList.find(
      (sc) => sc.campaign_name === promo.nama
    );
    if (campaign) {
      setIdSalesDiscount(campaign._id);
      setSalesDiscount(campaign.value);
      toast.success("Promo applied successfully");
      modalOpen("promo", false);
    } else {
      toast.error("Promo code not found");
    }
  };

  // Payment toggle
  const groupedPayments = payments.reduce((acc, payment) => {
    if (!acc[payment.payment_method]) {
      acc[payment.payment_method] = [];
    }
    acc[payment.payment_method].push(payment);
    return acc;
  }, {});

  // Toggle payments expansion
  const togglePayments = (payments) => {
    setExpandedPayments((prev) => ({
      ...prev,
      [payments]: !prev[payments],
    }));
  };

  // Search filtering
  const filteredKasirItems = kasirItems.filter((item) => {
    const searchLower = searchQuery.toLowerCase().trim();
    if (!searchLower) return true;
    return (
      item.product.name.toLowerCase().includes(searchLower) ||
      item.product.code.toLowerCase().includes(searchLower) ||
      item.selectedSize?.name?.toLowerCase().includes(searchLower) ||
      item.selectedExtra?.name?.toLowerCase().includes(searchLower) ||
      (!isNaN(searchLower) &&
        item.product.priceAfterDiscount.toString().includes(searchLower)) ||
      (!isNaN(searchLower) && item.quantity.toString() === searchLower)
    );
  });

  if (isLoading) return <Loading />;
  return (
    <div className="w-full h-screen pt-16 relative bg-[#F7F7F7]">
      <Header
        title="Sales"
        subtitle="Process Customer Orders"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        modalOpen={modalOpen}
        isSearch={true}
        isAdd={true}
      />

      <div className="p-4 mx-auto max-w-4xl">
        <div className="grid grid-cols-2 gap-4 mb-6 bg-white p-4 rounded-lg shadow-md">
          <div className="relative">
            <label className="absolute top-2 left-4 text-sm text-gray-500 bg-white px-1 font-semibold">
              Customer Name
            </label>
            <input
              id="infoBuyyerNama"
              type="text"
              name="nama"
              value={infoBuyyer?.nama}
              onChange={handleInfoChange}
              className="w-full p-4 h-20 border rounded-lg text-black bg-white  placeholder-white shadow-md"
            />
          </div>
          <div className="relative">
            <label className="absolute top-2 left-4 text-sm text-gray-500 bg-white px-1 font-semibold">
              Table Number
            </label>
            <select
              id="nomer"
              name="id_table_cust"
              value={
                kasirItems?.[0]?.informasi?.id_table_cust ??
                tableNumber.nomor ??
                ""
              }
              onChange={tableHandleChange}
              className="w-full p-4 h-20 border rounded-lg bg-white text-gray-700 shadow-md"
              required
            >
              <option value="" disabled>
                === Select Table ===
              </option>
              {tableList.length === 0 ? (
                <option value="default">No Table available</option>
              ) : (
                tableList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Orders</h2>
            <AddButton
              onClick={() => modalOpen("add", true)}
              content="+ Add Order"
            />
          </div>

          {filteredKasirItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <ul className="space-y-4">
              {filteredKasirItems.map((item, index) => (
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
                    <p className="text-sm">
                      {[
                        item.selectedSize?.name || "No size",
                        item.selectedExtra?.name || "No variant",
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <p className="font-semibold mr-4 relative">
                      {item.product.price !==
                        item.product.priceAfterDiscount && (
                        <s className="font-bold text-sm text-red-500 italic absolute -top-5 -left-5">
                          Rp.{" "}
                          {new Intl.NumberFormat("id-ID").format(
                            item.product.price
                          )}
                        </s>
                      )}
                      Rp.{" "}
                      {new Intl.NumberFormat("id-ID").format(
                        item.product.priceAfterDiscount
                      )}
                    </p>
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const newQuantity =
                            e.target.value.trim() === ""
                              ? 1
                              : Number(e.target.value);
                          handleQuantityChange(index, newQuantity);
                        }}
                        min="1"
                        className="text-center bg-transparent text-lg w-8 outline-none border-none"
                      />
                      <div className="flex flex-col items-center ml-2 -space-y-2.5">
                        <button
                          onClick={() =>
                            handleQuantityChange(index, item.quantity + 1)
                          }
                          className="text-lg bg-transparent leading-none"
                        >
                          <TiArrowSortedUp />
                        </button>
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              index,
                              Math.max(item.quantity - 1, 1)
                            )
                          }
                          className={`text-lg bg-transparent leading-none ${
                            item.quantity <= 1 ? "opacity-50" : ""
                          }`}
                        >
                          <TiArrowSortedDown />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleDelete(index, item.product.id, item.quantity)
                      }
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

        <div className="flex justify-between mb-6">
          <div>
            {infoBuyyer.keterangan || kasirItems[0]?.informasi ? (
              <AddButton
                onClick={() => modalOpen("note", true)}
                content={
                  <div className="flex items-center justify-center gap-2">
                    <CgNotes className="w-5 h-5" /> <span>+ Add Note</span>
                  </div>
                }
              />
            ) : (
              <CloseButton
                onClick={() => modalOpen("note", true)}
                content={
                  <div className="flex items-center justify-center gap-2">
                    <CgNotes className="w-5 h-5" /> <span>+ Add Note</span>
                  </div>
                }
              />
            )}
            {(kasirItems[0]?.informasi ||
              infoBuyyer.keterangan.trim() !== "") && (
              <p className="text-gray-500 text-sm mt-2">Note added</p>
            )}
          </div>
          <select
            value={infoBuyyer.status}
            name="status"
            onChange={handleInfoChange}
            className="border p-2 rounded-lg bg-white"
          >
            <option value={1}>Active</option>
            <option value={2}>Pending</option>
          </select>
        </div>

        <div className="text-right">
          <p className="text-lg font-bold mb-2">
            Sub Total: Rp.{" "}
            {new Intl.NumberFormat("id-ID").format(
              kasirItems.reduce(
                (total, item) =>
                  total + item.quantity * item.product.priceAfterDiscount,
                0
              )
            )}
          </p>
          <p className="text-lg font-bold mb-2">
            Discount: {salesDiscount != null ? `${salesDiscount * 100}%` : "-"}
          </p>
          <p className="text-lg font-bold mb-2">Tax: {tax * 100}%</p>
          <p className="text-lg font-bold mb-4">
            Total: Rp.{" "}
            {new Intl.NumberFormat("id-ID").format(
              Math.max(
                kasirItems.reduce(
                  (total, item) =>
                    total + item.quantity * item.product.priceAfterDiscount,
                  0
                ) *
                  (1 - (salesDiscount || 0)) *
                  (1 + tax),
                0
              )
            )}
          </p>
          <div className="flex justify-between">
            <SubmitButton
              onClick={() => modalOpen("pay", true)}
              content="Pay"
            />
          </div>
        </div>

        {/* Add Order Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => modalOpen("add", false)}
          title="Add Order"
          width="large"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product._id}
                onClick={
                  (product?.id_stock?.amount || 0) - (product?.orderQty || 0) >
                  0
                    ? () => handleCardClick(product)
                    : null
                }
                className={
                  (product?.id_stock?.amount || 0) - (product?.orderQty || 0) >
                  0
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-50"
                }
              >
                <Card
                  lebar={50}
                  tinggi={50}
                  image={product.image || "https://placehold.co/100x100"}
                  nama={product.name_product}
                  stock={
                    (product?.id_stock?.amount || 0) - (product?.orderQty || 0)
                  }
                  harga={`Rp ${new Intl.NumberFormat("id-ID").format(
                    Math.max(
                      product.sell_price *
                        (1 -
                          (itemCampaignList.find((icl) => {
                            const today = new Date()
                              .toISOString()
                              .split("T")[0];
                            return (
                              icl._id === product.id_item_campaign &&
                              icl.start_date <= today &&
                              icl.end_date >= today
                            );
                          })?.value || 0)),
                      0
                    )
                  )}`}
                />
              </div>
            ))}
          </div>
        </Modal>

        {/* Product Info Modal */}
        <Modal
          isOpen={isInfoModalOpen}
          onClose={() => {
            modalOpen("product", false);
            modalOpen("add", true);
          }}
          title={selectedProduct?.name_product}
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
                <AddMenu
                  key={extra._id}
                  onClick={() => setSelectedExtra(extra._id)}
                  content={extra.name}
                  isActive={selectedExtra === extra._id}
                />
              ))}
            </div>

            <p className="font-semibold mt-4 mb-2">Size</p>
            <div className="flex flex-wrap space-x-2">
              {selectedProduct?.id_size?.sizeDetails.map((size) => (
                <AddMenu
                  key={size._id}
                  size="medium"
                  onClick={() => setSelectedSize(size._id)}
                  content={size.name}
                  isActive={selectedSize === size._id}
                />
              ))}
            </div>

            <div className="flex items-center justify-center mt-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="py-2 px-3 border border-black rounded-md"
                disabled={quantity <= 1}
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
                disabled={
                  quantity >=
                  (selectedProduct?.id_stock?.amount || 0) -
                    (selectedProduct?.orderQty || 0)
                }
              >
                <FaPlus />
              </button>
            </div>
            {quantity >
              (selectedProduct?.id_stock?.amount || 0) -
                (selectedProduct?.orderQty || 0) && (
              <p className="text-red-500 text-center mt-2">
                Only{" "}
                {(selectedProduct?.id_stock?.amount || 0) -
                  (selectedProduct?.orderQty || 0)}{" "}
                in stock
              </p>
            )}
            <div className="flex justify-center mt-5">
              <SubmitButton
                onClick={addToCart}
                content="Add to Cart"
                disabled={
                  quantity === 0 ||
                  quantity >
                    (selectedProduct?.id_stock?.amount || 0) -
                      (selectedProduct?.orderQty || 0)
                }
              />
            </div>
          </div>
        </Modal>

        {/* Note Modal */}
        <Modal
          isOpen={isNoteModalOpen}
          onClose={() => modalOpen("note", false)}
          title="Order Note"
          width="large"
        >
          <textarea
            name="keterangan"
            value={infoBuyyer.keterangan}
            onChange={handleInfoChange}
            className="w-full p-4 h-20 border rounded-lg shadow-md bg-white"
            placeholder="Add your notes here"
          />
          <div className="flex justify-end mt-5 gap-2">
            <CloseButton
              onClick={() => modalOpen("note", false)}
              content="Cancel"
            />
            <SubmitButton
              onClick={() => modalOpen("note", false)}
              content="Save"
            />
          </div>
        </Modal>

        {/* Payment Modal */}
        <Modal
          isOpen={isPayModalOpen}
          onClose={() => modalOpen("pay", false)}
          title="Payment"
          width="large"
        >
          <div className="space-y-4">
            {/* Shopping Summary */}
            <div className="border rounded-lg shadow-md">
              <div className="bg-[var(--bg-primary)] text-white p-3 rounded-t-lg font-bold">
                Shopping Summary
              </div>
              <div className="p-4">
                <div className="flex justify-between text-gray-500 font-semibold text-sm pb-2 border-b border-gray-300">
                  <p className="w-1/2">Product</p>
                  <p className="w-1/4 text-center">Qty</p>
                  <p className="w-1/4 text-right">Price</p>
                </div>
                {kasirItems.map((item, index) => (
                  <div key={index} className="flex justify-between py-2">
                    <p className="w-1/2 font-semibold">{item.product.name}</p>
                    <p className="w-1/4 text-center">{item.quantity}</p>
                    <p className="w-1/4 text-right font-semibold">
                      Rp{" "}
                      {new Intl.NumberFormat("id-ID").format(
                        item.product.priceAfterDiscount
                      )}
                    </p>
                  </div>
                ))}
                <div className="flex justify-between text-green-500 font-semibold mt-2">
                  <p>Total Items</p>
                  <p>{kasirItems.length}</p>
                </div>
                <div className="flex justify-between text-green-500 font-semibold mt-2">
                  <p>Shipping Cost</p>
                  <p>0</p>
                </div>
                <div className="border-b border-dashed border-gray-300 my-2"></div>
                <div className="flex justify-between font-bold text-lg mt-3">
                  <p>Total Price</p>
                  <p className="text-orange-500">
                    Rp.{" "}
                    {new Intl.NumberFormat("id-ID").format(
                      kasirItems.reduce(
                        (total, item) =>
                          total +
                          item.quantity * item.product.priceAfterDiscount,
                        0
                      )
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <PaymentMethod
              groupedPayments={groupedPayments}
              selectedMethod={selectedMethod}
              setSelectedMethod={setSelectedMethod}
            />

            {/* Promo Code */}
            <div className="border rounded-lg shadow-md">
              <div className="bg-[var(--bg-primary)] text-white p-3 font-bold">
                Promo Code
              </div>
              <form onSubmit={handleSubmitPromo} className="p-4">
                <input
                  type="text"
                  value={promo?.nama || ""}
                  onChange={handlePromoChange}
                  placeholder="Enter Promo Code..."
                  className="w-full p-3 border rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div className="mt-4">
                  <SubmitButton content="Add Promo" />
                </div>
              </form>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <SubmitButton
                onClick={(e) => handleSales(e)}
                content="Pay Now"
                className="w-full py-3 bg-[#642416] hover:bg-[#4e1b10]"
              />
              <AddButton
                onClick={(e) => handleSales(e)}
                content="Dine In"
                className="w-full py-3 bg-[#fddc05] hover:bg-[#e6c304]"
              />
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Kasir;
