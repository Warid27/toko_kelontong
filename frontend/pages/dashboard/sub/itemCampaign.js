import React, { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import Image from "next/image";
import { MdKeyboardArrowDown } from "react-icons/md";
import client from "@/libs/axios";
import { Modal } from "@/components/Modal";
import { HiDotsHorizontal } from "react-icons/hi";
import Swal from "sweetalert2";
import { MdDelete } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import DateTimePicker from "@/components/DateTimePicker";
import Select from "react-select";
import { fetchCompanyList } from "@/libs/fetching/company";
import { fetchUserList } from "@/libs/fetching/user";
import { fetchStoreList } from "@/libs/fetching/store";
import { fetchItemCampaignList } from "@/libs/fetching/itemCampaign";
import ReactPaginate from "react-paginate";

const ItemCampaign = () => {
  const [itemCampaign, setItemCampaign] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [itemCampaignToUpdate, setItemCampaignToUpdate] = useState(null); // Untuk menyimpan produk yang akan diupdate
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // Untuk mengontrol tampilan modal update
  const [loading, setLoading] = useState(false); // Untuk loading saat update status
  const [storeList, setStoreList] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState("");

  const [itemCampaignDataAdd, setItemCampaignDataAdd] = useState({
    item_campaign_name: "",
    rules: "",
    value: "",
    start_date: new Date(),
    end_date: new Date(),
    status: "",
  });

  const [itemCampaignDataUpdate, setItemCampaignDataUpdate] = useState({
    id: "",
    item_campaign_name: "",
    rules: "",
    value: "",
    start_date: new Date(),
    end_date: new Date(),
    status: "",
  });
  const id_store =
    localStorage.getItem("id_store") == "undefined"
      ? null
      : localStorage.getItem("id_store");
  const id_company =
    localStorage.getItem("id_company") == "undefined"
      ? null
      : localStorage.getItem("id_company");
  const id_user =
    localStorage.getItem("id_user") == "undefined"
      ? null
      : localStorage.getItem("id_user");
  const token = localStorage.getItem("token");

  // --- Function
  const modalOpen = (param, bool) => {
    const setters = {
      add: setIsModalOpen,
      update: setIsUpdateModalOpen,
    };
    if (setters[param]) {
      setters[param](bool);
    }
  };

  useEffect(() => {
    const fetching_requirement = async () => {
      const get_user_list = async () => {
        const data_user = await fetchUserList();
        setUserList(data_user);
        setIsLoading(false);
      };
      const get_company_list = async () => {
        const data_company = await fetchCompanyList();
        setCompanyList(data_company);
        setIsLoading(false);
      };
      const get_store_list = async () => {
        const data_store = await fetchStoreList();
        setStoreList(data_store);
        setIsLoading(false);
      };
      const get_itemCampaign_list = async () => {
        const data_itemCampaign = await fetchItemCampaignList();
        setItemCampaign(data_itemCampaign);
        setIsLoading(false);
      };
      get_user_list();
      get_company_list();
      get_store_list();
      get_itemCampaign_list();
    };
    fetching_requirement();
  }, []);

  const handleUpdateItemCampaign = (itemCampaign, params) => {
    setItemCampaignToUpdate(itemCampaign); // Menyimpan produk yang dipilih
    modalOpen(params, true);
  };

  const deleteItemCampaignById = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    });

    if (result.isConfirmed) {
      try {
        const response = await client.delete(`/api/itemcampaign/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          Swal.fire("Berhasil", "ItemCampaign berhasil dihapus!", "success");
          setItemCampaign((prevItemCampaigns) =>
            prevItemCampaigns.filter((p) => p._id !== id)
          );
        }
      } catch (error) {
        console.error("Gagal menghapus ItemCampaign:", error.message);
        Swal.fire("Gagal", "ItemCampaign tidak dapat dihapus!", "error");
      }
    }
  };

  const handleChangeAdd = (value, name) => {
    setItemCampaignDataAdd((prevState) => ({
      ...prevState,
      [name]: value instanceof Date ? value.toISOString() : value,
    }));
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    console.log("datanya cok asuk", itemCampaignDataAdd);

    try {
      // Ensure all required fields are filled
      if (
        !itemCampaignDataAdd.item_campaign_name ||
        !itemCampaignDataAdd.rules ||
        !itemCampaignDataAdd.value ||
        !itemCampaignDataAdd.start_date ||
        !itemCampaignDataAdd.end_date
      ) {
        alert("Please fill all required fields.");
        return;
      }

      let value = itemCampaignDataAdd.value;
      if (value.includes(",")) {
        alert("Discount can't have comma.");
        return;
      }

      value = itemCampaignDataAdd.value / 100;

      // Send product data to the backend
      const response = await client.post(
        "/itemcampaign/additemcampaign",
        {
          item_campaign_name: itemCampaignDataAdd.item_campaign_name,
          rules: itemCampaignDataAdd.rules,
          value: value,
          start_date: itemCampaignDataAdd.start_date,
          end_date: itemCampaignDataAdd.end_date,
          id_store: id_store,
          id_company: id_company,
          id_user: id_user,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Auto Reload
      modalOpen("add", false);
      Swal.fire("Berhasil", "Item Campaign berhasil ditambahkan!", "success");
      setItemCampaign((prevItemCampaigns) => [
        ...prevItemCampaigns,
        response.data,
      ]);
    } catch (error) {
      console.error("Error adding ItemCampaign:", error);
    }
  };

  useEffect(() => {
    if (itemCampaignToUpdate) {
      setItemCampaignDataUpdate({
        id: itemCampaignToUpdate._id || "",
        item_campaign_name: itemCampaignToUpdate.item_campaign_name || "", // Menyimpan URL gambar lama
        rules: itemCampaignToUpdate.rules || "",
        value: itemCampaignToUpdate.value * 100 || "",
        start_date: itemCampaignToUpdate.start_date || "",
        end_date: itemCampaignToUpdate.end_date || "",
      });
    }
  }, [itemCampaignToUpdate]);

  const handleChangeUpdate = (value, name) => {
    setItemCampaignDataUpdate((prevState) => ({
      ...prevState,
      [name]: value instanceof Date ? value.toISOString() : value, // 🔹 Hanya ubah `Date` ke ISO
    }));
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    for (const key in itemCampaignDataUpdate) {
      formData.append(key, itemCampaignDataUpdate[key]);
    }

    try {
      let value = itemCampaignDataUpdate.value;
      if (value.includes(",")) {
        alert("Discount can't have comma.");
        return;
      }

      value = itemCampaignDataUpdate.value / 100;

      const response = await client.put(
        `/api/itemcampaign/${itemCampaignDataUpdate.id}`,
        {
          item_campaign_name: itemCampaignDataUpdate.item_campaign_name || "", // Menyimpan URL gambar lama
          rules: itemCampaignDataUpdate.rules || "",
          value: value || "",
          start_date: itemCampaignDataUpdate.start_date || "",
          end_date: itemCampaignDataUpdate.end_date || "",
          id_store: id_store,
          id_company: id_company,
          id_user: id_user,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Auto Reload
      modalOpen("update", false);
      Swal.fire("Berhasil", "item campaign berhasil diupdate!", "success");
      setItemCampaign((prevItemCampaigns) =>
        prevItemCampaigns.map((itemCampaign) =>
          itemCampaign._id === itemCampaignDataUpdate.id
            ? response.data
            : itemCampaign
        )
      );
    } catch (error) {
      console.error("Error updating ItemCampaign:", error);
    }
  };

  const filteredItemCampaignList = itemCampaign.filter((item) =>
    item.item_campaign_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startIndex = currentPage * itemsPerPage;
  const selectedData = filteredItemCampaignList.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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
            <p className="text-2xl font-bold">Daftar Item Campaign</p>
            <p>Detail Daftar Item Campaign</p>
          </div>
          <div className="relative mt-2 flex flex-row space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari diskon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 pr-4 py-2 border border-gray-300 rounded-md w-full max-w-xs bg-white"
              />
              <IoSearchOutline className="absolute left-2 top-2.5 text-xl text-gray-500" />
            </div>
            <div className="avatar">
              <div className="w-10 h-10 rounded-full">
                <Image
                  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                  alt="avatar"
                  width={40}
                  height={40}
                />
              </div>
            </div>
            <button className="button btn-ghost btn-sm rounded-lg">
              <MdKeyboardArrowDown className="text-2xl mt-1" />
            </button>
          </div>
        </div>
        <div className="flex flex-row justify-between mt-8">
          <div>
            <select className="select w-full max-w-xs bg-white border-gray-300">
              <option value="">Best sellers</option>
              <option value="">Ricebowl</option>
              <option value="">Milkshake</option>
            </select>
          </div>
          <div>
            <button className="addBtn" onClick={() => modalOpen("add", true)}>
              + Tambah ItemCampaign
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          <div>
            {filteredItemCampaignList.length === 0 ? (
              <h1>Data campaign tidak ditemukan!</h1>
            ) : (
              <>
                <table className="table w-full border border-gray-300">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Nama Item Campaign</th>
                      <th>Rules</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Value</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedData.map((itemCampaign, index) => (
                      <tr key={itemCampaign._id}>
                        <td>{startIndex + index + 1}</td>
                        <td>{itemCampaign.item_campaign_name}</td>
                        <td>{itemCampaign.rules}</td>
                        <td>{itemCampaign.start_date}</td>
                        <td>{itemCampaign.end_date}</td>
                        <td>{itemCampaign.value * 100}%</td>
                        <td className="flex space-x-4">
                          {" "}
                          {/* Beri jarak antar tombol */}
                          <button
                            className=" p-3 rounded-lg text-2xl "
                            onClick={() =>
                              deleteItemCampaignById(itemCampaign._id)
                            }
                          >
                            <MdDelete />
                          </button>
                          <button
                            className=" p-3 rounded-lg text-2xl "
                            onClick={() =>
                              handleUpdateItemCampaign(itemCampaign, "update")
                            }
                          >
                            <FaRegEdit />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <ReactPaginate
                  previousLabel={"← Prev"}
                  nextLabel={"Next →"}
                  pageCount={Math.ceil(itemCampaign.length / itemsPerPage)}
                  onPageChange={({ selected }) => setCurrentPage(selected)}
                  containerClassName={"flex gap-2 justify-center mt-4"}
                  pageLinkClassName={"border px-3 py-1"}
                  previousLinkClassName={"border px-3 py-1"}
                  nextLinkClassName={"border px-3 py-1"}
                  activeClassName={"bg-blue-500 text-white"}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <Modal
          onClose={() => modalOpen("add", false)}
          title={"Tambah Item Campaign"}
        >
          <form onSubmit={handleSubmitAdd}>
            <p className="font-semibold mt-4">Nama Item Campaign</p>
            <input
              type="text"
              name="item_campaign_name"
              value={itemCampaignDataAdd.item_campaign_name}
              onChange={(e) => handleChangeAdd(e.target.value, e.target.name)}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4">Rules</p>
            <input
              type="text"
              name="rules"
              value={itemCampaignDataAdd.rules}
              onChange={(e) => handleChangeAdd(e.target.value, e.target.name)}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4">Start Date</p>
            {/* <DateTimePicker onChange={handleChangeAdd} value={itemCampaignDataAdd.start_date} name="start_date"></DateTimePicker> */}
            <DateTimePicker
              onChange={(date) => handleChangeAdd(date, "start_date")}
              value={
                itemCampaignDataAdd.start_date
                  ? new Date(itemCampaignDataAdd.start_date)
                  : null
              }
              name="start_date"
            />
            <p className="font-semibold mt-4">End Date</p>
            <DateTimePicker
              onChange={(date) => handleChangeAdd(date, "end_date")}
              value={
                itemCampaignDataAdd.end_date
                  ? new Date(itemCampaignDataAdd.end_date)
                  : null
              }
              minDate={
                itemCampaignDataAdd.start_date
                  ? new Date(itemCampaignDataAdd.start_date)
                  : null
              }
              name="end_date"
            />
            <p className="font-semibold mt-4 mb-2">Value</p>
            <div className="relative mt-4">
              <input
                type="number"
                name="value"
                value={itemCampaignDataAdd.value}
                onChange={(e) => handleChangeAdd(e.target.value, e.target.name)}
                className="border rounded-md p-2 pr-8 w-full bg-white"
                required
                max={99}
                min={1}
                step={1}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none">
                %
              </span>
            </div>

            <div className="flex justify-end mt-5">
              <button
                type="button"
                className="closeBtn"
                onClick={() => modalOpen("add", false)}
              >
                Batal
              </button>
              <button type="submit" className="submitBtn">
                Tambah
              </button>
            </div>
          </form>
        </Modal>
      )}
      {isUpdateModalOpen && (
        <Modal
          onClose={() => modalOpen("update", false)}
          title={"Edit Item Campaign"}
        >
          <form onSubmit={handleSubmitUpdate}>
            <p className="font-semibold mt-4">Nama Item Campaign</p>
            <input
              type="text"
              name="item_campaign_name"
              value={itemCampaignDataUpdate.item_campaign_name}
              onChange={(e) =>
                handleChangeUpdate(e.target.value, e.target.name)
              }
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4">Rules</p>
            <input
              type="text"
              name="rules"
              value={itemCampaignDataUpdate.rules}
              onChange={(e) =>
                handleChangeUpdate(e.target.value, e.target.name)
              }
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4">Start Date</p>
            <DateTimePicker
              onChange={(date) => handleChangeUpdate(date, "start_date")}
              value={
                itemCampaignDataUpdate.start_date
                  ? new Date(itemCampaignDataUpdate.start_date)
                  : null
              }
              name="start_date"
            />
            <p className="font-semibold mt-4">End Date</p>
            <DateTimePicker
              onChange={(date) => handleChangeUpdate(date, "end_date")}
              value={
                itemCampaignDataUpdate.end_date
                  ? new Date(itemCampaignDataUpdate.end_date)
                  : null
              }
              minDate={
                itemCampaignDataUpdate.start_date
                  ? new Date(itemCampaignDataUpdate.start_date)
                  : null
              }
              name="end_date"
            />
            <p className="font-semibold mt-4 mb-2">Value</p>
            <div className="relative mt-4">
              <input
                type="number"
                name="value"
                value={itemCampaignDataUpdate.value}
                onChange={(e) =>
                  handleChangeUpdate(e.target.value, e.target.name)
                }
                className="border rounded-md p-2 pr-8 w-full bg-white"
                required
                max={99}
                min={1}
                step={1}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none">
                %
              </span>
            </div>
            <div className="flex justify-end mt-5">
              <button
                onClick={() => modalOpen("update", false)}
                className="closeBtn"
              >
                Batal{" "}
              </button>
              <button type="submit" className="submitBtn">
                Simpan
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ItemCampaign;
