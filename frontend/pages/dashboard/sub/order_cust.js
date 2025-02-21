import React, { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import Image from "next/image";
import { MdKeyboardArrowDown } from "react-icons/md";
import client from "@/libs/axios";
import { HiDotsHorizontal } from "react-icons/hi";
import Swal from "sweetalert2";
import { MdDelete } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import { Modal } from "@/components/Modal";
import { LiaCloudUploadAltSolid } from "react-icons/lia";
import Cookies from "js-cookie";
import ContentRenderer from "@/components/nav/renderContents"; // Import the new component
const OrderCust = ({ setSelectedLink }) => {
  const [listOrder, setListOrder] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [productToUpdate, setProductToUpdate] = useState(null); // Untuk menyimpan produk yang akan diupdate
  const [loading, setLoading] = useState(false); // Untuk loading saat update status
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [productList, setProductList] = useState([]);
  const [tableList, setTableList] = useState([]);
  const [itemCampaignList, setItemCampaignList] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await client.post("/product/listproduct", {});
        const data = response.data;

        // Validate that the response is an array
        if (!Array.isArray(data)) {
          console.error(
            "Unexpected data format from /product/listproduct:",
            data
          );
          setProductList([]);
        } else {
          setProductList(data);
        }
      } catch (error) {
        console.error("Error fetching size:", error);
        setProductList([]);
      }
    };
    fetchProduct();
  }, []);
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
    const fetchTable = async () => {
      try {
        const response = await client.get("/table/listtable");
        const data = response.data;

        // Validate that the response is an array
        if (!Array.isArray(data)) {
          console.error("Unexpected data format from /table/listtable:", data);
          setTableList([]);
        } else {
          setTableList(data);
        }
      } catch (error) {
        console.error("Error fetching table:", error);
        setTableList([]);
      }
    };
    fetchTable();
  }, []);

  const openModalAdd = () => {
    setIsModalOpen(true);
  };

  const closeModalAdd = () => {
    setIsModalOpen(false);
  };
  const openModalUpdate = () => {
    setIsUpdateModalOpen(true);
  };

  const closeModalUpdate = () => {
    setIsUpdateModalOpen(false);
  };
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        const id_store = localStorage.getItem("id_store");

        if (!id_store) {
          console.error("id_store is missing in localStorage");
          setIsLoading(false);
          return;
        }

        const response = await client.post(
          "/order/listorder",
          {}, // Pass id_store in the request body
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const filter = response.data.filter((num) => num.status == "2");
        // Set the fetched order into state
        setListOrder(filter);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching order:", error);
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, []);

  const processSubmit = (data) => {
    const orderData = { ...data };
    Cookies.set("kasirItems", JSON.stringify(orderData), { expires: 7 });
  };

  // function
  const handleNavigateToKasir = () => {
    // Update the selectedLink to "kasir"
    setSelectedLink("kasir");
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen pt-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen pt-16">
      <div className="justify-between w-full bg-white shadow-lg p-4">
        <div className="flex flex-row justify-between">
          <div className="flex flex-col">
            <p className="text-2xl font-bold">Pesanan Masuk</p>
            <p>Detail Pesanan Masuk</p>
          </div>
        </div>
      </div>

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          <div className="overflow-x-auto">
            {listOrder.length === 0 ? (
              <h1>Pesanan tidak ditemukan!</h1>
            ) : (
              <table className="table w-full border border-gray-300">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Pelanggan</th>
                    <th>No Meja</th>
                    <th>Jumlah Pesanan</th>
                    <th>Total Harga</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {listOrder.map((order, index) => (
                    <tr key={order._id}>
                      <td>{index + 1}</td>
                      <td>{order.person_name}</td>
                      <td>
                        {tableList.find((tl) => tl._id == order.id_table_cust)
                          ?.name || "Unknown"}
                      </td>
                      <td>{order.orderDetails.length}</td>
                      <td>
                        {order.orderDetails
                          .map((od) => od.total_price)
                          .reduce((acc, curr) => acc + curr, 0)}
                      </td>
                      <td>
                        <button
                          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
                          onClick={() => {
                            console.log("order", order);
                            const {
                              __reactFiber$ihwx534u59,
                              __reactProps,
                              ...safeOrder
                            } = order;
                            console.log("safeorder", safeOrder);
                            // const productnya = safeOrder.orderDetails.map((od) =>
                            //   productList.find((pl) => pl._id === od.id_product)
                            // );
                            const orderFormat = safeOrder.orderDetails.map(
                              (od) => {
                                const selectedProduct = productList.find(
                                  (pl) => pl._id === od.id_product
                                );

                                const today = new Date()
                                  .toISOString()
                                  .split("T")[0]; // Format YYYY-MM-DD untuk membandingkan tanggal

                                const campaign = itemCampaignList.find(
                                  (icl) =>
                                    icl._id ===
                                      selectedProduct.id_item_campaign &&
                                    icl.start_date <= today &&
                                    icl.end_date >= today
                                );

                                const discountValue = campaign
                                  ? campaign.value
                                  : 0;

                                return {
                                  informasi: {
                                    id_order: order._id,
                                    code: order.code,
                                    id_table_cust: order.id_table_cust,
                                    person_name: order.person_name,
                                    keterangan: order.keterangan,
                                  },
                                  product: {
                                    id: selectedProduct?._id || null,
                                    id_company:
                                      selectedProduct?.id_company || null,
                                    id_store: selectedProduct?.id_store || null,
                                    id_item_campaign:
                                      selectedProduct?.id_item_campaign || null,
                                    name:
                                      selectedProduct?.name_product ||
                                      "Unknown",
                                    image: selectedProduct?.image || "",
                                    // price: od?.total_price || 0,
                                    price: selectedProduct?.sell_price || 0,
                                    product_code:
                                      selectedProduct?.product_code || "",

                                    diskon: discountValue,
                                    // selectedProduct.id_item_campaign != null
                                    //   ? itemCampaignList.find(
                                    //       (icl) =>
                                    //         icl._id ==
                                    //         selectedProduct.id_item_campaign
                                    //     )?.value
                                    //   : 0,
                                    priceAfterDiscount:
                                      selectedProduct.sell_price *
                                      (1 - discountValue),
                                    //   priceAfterDiscount:
                                    //     selectedProduct.sell_price *
                                    //     (1 -
                                    //       (selectedProduct.id_item_campaign !=
                                    //       null
                                    //         ? itemCampaignList.find(
                                    //             (icl) =>
                                    //               icl._id ==
                                    //               selectedProduct.id_item_campaign
                                    //           )?.value || 0
                                    //         : 0)),
                                  },
                                  quantity: od.quantity || 1,
                                  selectedExtra: od.id_extrasDetails
                                    ? {
                                        _id: od.id_extrasDetails,
                                        name:
                                          selectedProduct?.id_extras?.extrasDetails.find(
                                            (extra) =>
                                              extra._id === od.id_extrasDetails
                                          )?.name || "Unknown Extra",
                                      }
                                    : null,
                                  selectedSize: od.id_sizeDetails
                                    ? {
                                        _id: od.id_sizeDetails,
                                        name:
                                          selectedProduct?.id_size?.sizeDetails.find(
                                            (size) =>
                                              size._id === od.id_sizeDetails
                                          )?.name || "Unknown Size",
                                      }
                                    : null,
                                };
                              }
                            );

                            console.log("orderformatnya ni", orderFormat);
                            Cookies.set(
                              "kasirItems",
                              JSON.stringify(orderFormat),
                              { expires: 7 }
                            );
                            handleNavigateToKasir();
                            // console.log("kuki manok", Cookies.get("kasirItems"))
                            // console.log("kuki json", JSON.parse(Cookies.get("kasirItems")))
                          }}
                        >
                          Process
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCust;
