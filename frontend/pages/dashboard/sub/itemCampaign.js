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

  const [itemCampaignDataAdd, setItemCampaignDataAdd] = useState({
    item_campaign_name: "",
    rules: "",
    value: "",
    start_date: new Date(),
    end_date: new Date(),
    id_store: "",
    id_company: "",
    id_user: "",
    status: "",
  });

  const [itemCampaignDataUpdate, setItemCampaignDataUpdate] = useState({
    id: "",
    item_campaign_name: "",
    rules: "",
    value: "",
    start_date: new Date(),
    end_date: new Date(),
    id_store: "",
    id_company: "",
    id_user: "",
    status: "",
  });

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
    const fetchStore = async () => {
      try {
        const response = await client.post("/store/liststore", {});
        const data = response.data;

        // Validate that the response is an array
        if (!Array.isArray(data)) {
          console.error("Unexpected data format from /store/liststore:", data);
          setStoreList([]);
        } else {
          setStoreList(data);
        }
      } catch (error) {
        console.error("Error fetching store:", error);
        setStoreList([]);
      }
    };
    fetchStore();
  }, []);
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await client.post("/company/listcompany", {});
        const data = response.data;

        // Validate that the response is an array
        if (!Array.isArray(data)) {
          console.error(
            "Unexpected data format from /company/listcompany:",
            data
          );
          setCompanyList([]);
        } else {
          setCompanyList(data);
        }
      } catch (error) {
        console.error("Error fetching company:", error);
        setCompanyList([]);
      }
    };
    fetchCompany();
  }, []);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await client.post("/user/listuser", {});
        const data = response.data;

        // Validate that the response is an array
        if (!Array.isArray(data)) {
          console.error("Unexpected data format from /user/listuser:", data);
          setUserList([]);
        } else {
          setUserList(data);
        }
      } catch (error) {
        console.error("Error fetching store:", error);
        setUserList([]);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
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

        // Set the fetched itemCampaign into state
        setItemCampaign(response.data);
        console.log("SET ITEMS", itemCampaign);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching itemCampaign:", error);
        setIsLoading(false);
      }
    };

    fetchItemCampaign();
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
        const token = localStorage.getItem("token");
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
      const token = localStorage.getItem("token");

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
          id_store: itemCampaignDataAdd.id_store,
          id_company: itemCampaignDataAdd.id_company,
          id_user: itemCampaignDataAdd.id_user,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Auto Reload
      modalOpen("add", false);
      Swal.fire("Berhasil", "Kategori Produk berhasil ditambahkan!", "success");
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
        id_store: itemCampaignToUpdate.id_store || "",
        id_company: itemCampaignToUpdate.id_company || "",
        id_user: itemCampaignToUpdate.id_user || "",
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
      const token = localStorage.getItem("token");

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
          id_store: itemCampaignDataUpdate.id_store || "",
          id_company: itemCampaignDataUpdate.id_company || "",
          id_user: itemCampaignDataUpdate.id_user || "",
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Auto Reload
      modalOpen("update", false);
      Swal.fire("Berhasil", "Produk berhasil diupdate!", "success");
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
                placeholder="Search anything here"
                className="pl-10 h-10 pr-4 py-2 border border-gray-300 rounded-md w-full max-w-xs"
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
              <option disabled selected>
                Best sellers
              </option>
              <option>Ricebowl</option>
              <option>Milkshake</option>
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
          <div className="overflow-x-auto">
            {itemCampaign.length === 0 ? (
              <h1>Data campaign tidak ditemukan!</h1>
            ) : (
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
                  {itemCampaign.map((itemCampaign, index) => (
                    <tr key={itemCampaign._id}>
                      <td>{index + 1}</td>
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
            <p className="font-semibold mt-4 mb-2">Store</p>
            <Select
              id="store"
              className="basic-single"
              options={storeList.map((c) => ({
                value: c._id,
                label: c.name,
              }))}
              value={
                storeList
                  .map((c) => ({ value: c._id, label: c.name }))
                  .find((opt) => opt.value === itemCampaignDataAdd.id_store) ||
                null
              }
              onChange={(selectedOption) =>
                setItemCampaignDataAdd((prevState) => ({
                  ...prevState,
                  id_store: selectedOption ? selectedOption.value : "",
                }))
              }
              isSearchable
              required
              placeholder="Pilih Store..."
              noOptionsMessage={() => "No Store available"}
            />
            <p className="font-semibold mt-4 mb-2">Company</p>
            <Select
              id="company"
              className="basic-single"
              options={companyList.map((c) => ({
                value: c._id,
                label: c.name,
              }))}
              value={
                companyList
                  .map((c) => ({ value: c._id, label: c.name }))
                  .find(
                    (opt) => opt.value === itemCampaignDataAdd.id_company
                  ) || null
              }
              onChange={(selectedOption) =>
                setItemCampaignDataAdd((prevState) => ({
                  ...prevState,
                  id_company: selectedOption ? selectedOption.value : "",
                }))
              }
              isSearchable
              required
              placeholder="Pilih Company..."
              noOptionsMessage={() => "No Company available"}
            />
            <p className="font-semibold mt-4 mb-2">User</p>
            <Select
              id="user"
              className="basic-single"
              options={userList.map((c) => ({
                value: c._id,
                label: c.username,
              }))}
              value={
                userList
                  .map((c) => ({ value: c._id, label: c.username }))
                  .find((opt) => opt.value === itemCampaignDataAdd.id_user) ||
                null
              }
              onChange={(selectedOption) =>
                setItemCampaignDataAdd((prevState) => ({
                  ...prevState,
                  id_user: selectedOption ? selectedOption.value : "",
                }))
              }
              isSearchable
              required
              placeholder="Pilih User..."
              noOptionsMessage={() => "No User available"}
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
            <p className="font-semibold mt-4 mb-2">Store</p>
            <Select
              id="store"
              className="basic-single"
              options={storeList.map((c) => ({
                value: c._id,
                label: c.name,
              }))}
              value={
                storeList
                  .map((c) => ({ value: c._id, label: c.name }))
                  .find(
                    (opt) => opt.value === itemCampaignDataUpdate.id_store
                  ) || null
              }
              onChange={(selectedOption) =>
                setItemCampaignDataUpdate((prevState) => ({
                  ...prevState,
                  id_store: selectedOption ? selectedOption.value : "",
                }))
              }
              isSearchable
              required
              placeholder="Pilih Store..."
              noOptionsMessage={() => "No Store available"}
            />
            <p className="font-semibold mt-4 mb-2">Company</p>
            <Select
              id="company"
              className="basic-single"
              options={companyList.map((c) => ({
                value: c._id,
                label: c.name,
              }))}
              value={
                companyList
                  .map((c) => ({ value: c._id, label: c.name }))
                  .find(
                    (opt) => opt.value === itemCampaignDataUpdate.id_company
                  ) || null
              }
              onChange={(selectedOption) =>
                setItemCampaignDataUpdate((prevState) => ({
                  ...prevState,
                  id_company: selectedOption ? selectedOption.value : "",
                }))
              }
              isSearchable
              required
              placeholder="Pilih Company..."
              noOptionsMessage={() => "No Company available"}
            />
            <p className="font-semibold mt-4 mb-2">User</p>
            <Select
              id="user"
              className="basic-single"
              options={userList.map((c) => ({
                value: c._id,
                label: c.username,
              }))}
              value={
                userList
                  .map((c) => ({ value: c._id, label: c.username }))
                  .find(
                    (opt) => opt.value === itemCampaignDataUpdate.id_user
                  ) || null
              }
              onChange={(selectedOption) =>
                setItemCampaignDataUpdate((prevState) => ({
                  ...prevState,
                  id_user: selectedOption ? selectedOption.value : "",
                }))
              }
              isSearchable
              required
              placeholder="Pilih User..."
              noOptionsMessage={() => "No User available"}
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
