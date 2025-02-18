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

  // const addNewItemCampaign = (newItemCampaign) => {
  //   setItemCampaign((prevItemCampaigns) => [...prevItemCampaigns, newItemCampaign]);
  // };

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

  // const handleAddItemCampaign = () => {
  //   setIsModalOpen(true);
  // };

  const handleUpdateItemCampaign = (itemCampaign) => {
    setItemCampaignToUpdate(itemCampaign); // Menyimpan produk yang dipilih
    setIsUpdateModalOpen(true);

    console.log(itemCampaign);
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
        // !itemCampaignDataAdd.id_store ||
        // !itemCampaignDataAdd.id_company ||
        // !itemCampaignDataAdd.id_user
      ) {
        alert("Please fill all required fields.");
        return;
      }

      // Send product data to the backend
      const response = await client.post(
        "/itemcampaign/additemcampaign",
        {
          item_campaign_name: itemCampaignDataAdd.item_campaign_name,
          rules: itemCampaignDataAdd.rules,
          value: itemCampaignDataAdd.value,
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

      console.log("ItemCampaign added:", response.data);
      Swal.fire("Berhasil", "ItemCampaign berhasil ditambahkan!", "success");

      // Reload the page or update state
      // onClose();
      window.location.reload();
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
        value: itemCampaignToUpdate.value || "",
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
      // const productId = "67a9615bf59ec80d10014871";
      const token = localStorage.getItem("token");
      const response = await client.put(
        `/api/itemcampaign/${itemCampaignDataUpdate.id}`,
        {
          item_campaign_name: itemCampaignDataUpdate.item_campaign_name || "", // Menyimpan URL gambar lama
          rules: itemCampaignDataUpdate.rules || "",
          value: itemCampaignDataUpdate.value || "",
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
      console.log("ItemCampaign updated successfully:", response.data);
      // onClose();
      window.location.reload();
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
            <button
              className="button bg-[#FDDC05] text-white p-2 rounded-lg font-bold"
              onClick={openModalAdd}
            >
              + Tambah ItemCampaign
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          <div className="overflow-x-auto">
            {console.log("ITEM CAMPAIGN:", itemCampaign)}
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
                      <td>{itemCampaign.value}</td>
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
                          onClick={() => handleUpdateItemCampaign(itemCampaign)}
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
        <Modal onClose={closeModalAdd} title={"Tambah Item Campaign"}>
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
            <select
              id="store"
              name="id_store"
              className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={itemCampaignDataAdd.id_store}
              onChange={(e) =>
                setItemCampaignDataAdd((prevState) => ({
                  ...prevState,
                  id_store: e.target.value,
                }))
              }
              required
            >
              <option value="" disabled>
                === Pilih Store ===
              </option>

              {storeList.length === 0 ? (
                <option value="default">No store available</option>
              ) : (
                storeList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
            <p className="font-semibold mt-4 mb-2">Company</p>
            <select
              id="company"
              name="id_company"
              className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={itemCampaignDataAdd.id_company}
              onChange={(e) =>
                setItemCampaignDataAdd((prevState) => ({
                  ...prevState,
                  id_company: e.target.value,
                }))
              }
              required
            >
              <option value="" disabled>
                === Pilih Company ===
              </option>

              {companyList.length === 0 ? (
                <option value="default">No company available</option>
              ) : (
                companyList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
            <p className="font-semibold mt-4 mb-2">User</p>
            <select
              id="user"
              name="user"
              className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={itemCampaignDataAdd.id_user}
              onChange={(e) =>
                setItemCampaignDataAdd((prevState) => ({
                  ...prevState,
                  id_user: e.target.value,
                }))
              }
              required
            >
              <option value="" disabled>
                === Pilih User ===
              </option>

              {userList.length === 0 ? (
                <option value="default">No user available</option>
              ) : (
                userList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.username}
                  </option>
                ))
              )}
            </select>
            <p className="font-semibold mt-4 mb-2">Value</p>
            <input
              type="text"
              name="value"
              value={itemCampaignDataAdd.value}
              onChange={(e) => handleChangeAdd(e.target.value, e.target.name)}
              className="border rounded-md p-2 w-full bg-white"
              required
            />

            <div className="flex justify-end mt-5">
              <button
                type="button"
                className="bg-gray-500 text-white p-2 rounded-lg mr-2"
                onClick={closeModalAdd}
              >
                Batal
              </button>
              <button
                type="submit"
                // onClick={itemCampaignDataAdd}
                className="bg-blue-500 text-white p-2 rounded-lg"
              >
                Tambah
              </button>
            </div>
          </form>
        </Modal>
      )}
      {isUpdateModalOpen && (
        <Modal onClose={closeModalUpdate} title={"Edit Item Campaign"}>
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
            <select
              id="store"
              name="id_store"
              className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={itemCampaignDataUpdate.id_store}
              onChange={(e) =>
                setItemCampaignDataUpdate((prevState) => ({
                  ...prevState,
                  id_store: e.target.value,
                }))
              }
              required
            >
              <option value="" disabled>
                === Pilih Store ===
              </option>

              {storeList.length === 0 ? (
                <option value="default">No store available</option>
              ) : (
                storeList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
            <p className="font-semibold mt-4 mb-2">Company</p>
            <select
              id="company"
              name="id_company"
              className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={itemCampaignDataUpdate.id_company}
              onChange={(e) =>
                setItemCampaignDataUpdate((prevState) => ({
                  ...prevState,
                  id_company: e.target.value,
                }))
              }
              required
            >
              <option value="" disabled>
                === Pilih Company ===
              </option>

              {companyList.length === 0 ? (
                <option value="default">No company available</option>
              ) : (
                companyList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
            <p className="font-semibold mt-4 mb-2">User</p>
            <select
              id="user"
              name="id_user"
              className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={itemCampaignDataUpdate.id_user}
              onChange={(e) =>
                setItemCampaignDataUpdate((prevState) => ({
                  ...prevState,
                  id_user: e.target.value,
                }))
              }
              required
            >
              <option value="" disabled>
                === Pilih User ===
              </option>

              {userList.length === 0 ? (
                <option value="default">No user available</option>
              ) : (
                userList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.username}
                  </option>
                ))
              )}
            </select>
            <p className="font-semibold mt-4 mb-2">Value</p>
            <input
              type="text"
              name="value"
              min={0}
              max={1}
              value={itemCampaignDataUpdate.value}
              onChange={(e) =>
                handleChangeUpdate(e.target.value, e.target.name)
              }
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <div className="flex justify-end mt-5">
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded-lg"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ItemCampaign;
