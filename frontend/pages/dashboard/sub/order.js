import React, { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import Image from "next/image";
import { MdKeyboardArrowDown } from "react-icons/md";
import client from "@/libs/axios";
import { FaInfoCircle } from "react-icons/fa";
import Swal from "sweetalert2";
import { MdDelete } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import { Modal } from "@/components/Modal";
import Cookies from "js-cookie";
import ContentRenderer from "@/components/nav/renderContents";
import {fetchTableList} from "@/libs/fetching/table"
import {fetchOrderList} from "@/libs/fetching/order"

const Order = ({ setSelectedLink }) => {
  const [listOrder, setListOrder] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tableList, setTableList] = useState([]);
  const [orderToUpdate, setOrderToUpdate] = useState(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);


  useEffect(() => {
    const fetching_requirement = async () => {
      const id_store = localStorage.getItem("id_store");
      const get_table_list = async () => {
        const data_table = await fetchTableList();
        setTableList(data_table);
        setIsLoading(false)
      };
      const get_order_list = async () => {
        const data_order = await fetchOrderList();
        setListOrder(data_order);
        setIsLoading(false)
      };
      get_table_list();
      get_order_list();
    };
    fetching_requirement();
  }, []);

  // Open info modal
  const handleInfoDetails = (order) => {
    setOrderToUpdate(order);
    setIsInfoModalOpen(true);
  };

  // Close info modal
  const closeModalInfo = () => {
    setIsInfoModalOpen(false);
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
            <p className="text-2xl font-bold">Daftar Orderan</p>
            <p>Detail daftar orderan</p>
          </div>
        </div>
      </div>
      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          <div className="overflow-x-auto">
            {listOrder.length === 0 ? (
              <h1>Data Orderan tidak ditemukan!</h1>
            ) : (
              <table className="table w-full border border-gray-300">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Pelanggan</th>
                    <th>No Meja</th>
                    <th>Jumlah Pesanan</th>
                    <th>Total Harga</th>
                    <th>Status</th>
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
                      <td>{order.status == "2" ? "pending" : "selesai"}</td>
                      <td>
                        <button
                          className="p-3 rounded-lg text-2xl"
                          onClick={() => handleInfoDetails(order)}
                        >
                          <FaInfoCircle />
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

      {/* Info Modal */}
      {isInfoModalOpen && (
        <Modal onClose={closeModalInfo} title={"Order Detail"}>
          {orderToUpdate?.orderDetails?.map((detail, index) => (
            <div key={index}>
              <div>Detail {index + 1}</div>
              <div className="grid grid-cols-[auto_auto_1fr] gap-y-2 font-sans">
                <span className="text-left font-bold pr-2">Kode Produk</span>
                <span className="font-bold px-2">:</span>
                <span className="text-gray-700">
                  {detail.id_product?.product_code || "-"}
                </span>
                <span className="text-left font-bold pr-2">
                  Nama Order Detail
                </span>
                <span className="font-bold px-2">:</span>
                <span className="text-gray-700">
                  {detail.name_product || "-"}
                </span>
              </div>
              <hr />
            </div>
          ))}
        </Modal>
      )}
    </div>
  );
};

export default Order;
