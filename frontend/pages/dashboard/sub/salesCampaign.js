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

const SalesCampaign = () => {
  const [salesCampaign, setSalesCampaign] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [salesCampaignToUpdate, setSalesCampaignToUpdate] = useState(null); // Untuk menyimpan produk yang akan diupdate
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // Untuk mengontrol tampilan modal update
  const [loading, setLoading] = useState(false); // Untuk loading saat update status
  const [storeList, setStoreList] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [userList, setUserList] = useState([]);

  const [salesCampaignDataAdd, setSalesCampaignDataAdd] = useState({
    campaign_name: "",
    rules: "",
    start_date: new Date(),
    end_date: new Date(),
    id_store: "",
    id_company: "",
    id_user: "",
    value: "",
  });

  const [salesCampaignDataUpdate, setSalesCampaignDataUpdate] = useState({
    id: "",
    campaign_name: "",
    rules: "",
    start_date: "",
    end_date: "",
    id_store: "",
    id_company: "",
    id_user: "",
    value: "",
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

  // const addNewSalesCampaign = (newSalesCampaign) => {
  //   setSalesCampaign((prevSalesCampaigns) => [...prevSalesCampaigns, newSalesCampaign]);
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
    const fetchSalesCampaign = async () => {
      try {
        const token = localStorage.getItem("token");
        const id_store = localStorage.getItem("id_store");

        if (!id_store) {
          console.error("id_type is missing in localStorage");
          setIsLoading(false);
          return;
        }

        const response = await client.post("/salescampaign/listsalescampaign", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Set the fetched salesCampaign into state
        setSalesCampaign(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching salesCampaign:", error);
        setIsLoading(false);
      }
    };

    fetchSalesCampaign();
  }, []);

  // const handleAddSalesCampaign = () => {
  //   setIsModalOpen(true);
  // };

  const handleUpdateSalesCampaign = (salesCampaign) => {
    setSalesCampaignToUpdate(salesCampaign); // Menyimpan produk yang dipilih
    setIsUpdateModalOpen(true);

    console.log(salesCampaign);
  };

  const deleteSalesCampaignById = async (id) => {
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
        const response = await client.delete(`/api/salescampaign/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          Swal.fire("Berhasil", "SalesCampaign berhasil dihapus!", "success");
          setSalesCampaign((prevSalesCampaigns) =>
            prevSalesCampaigns.filter((p) => p._id !== id)
          );
        }
      } catch (error) {
        console.error("Gagal menghapus SalesCampaign:", error.message);
        Swal.fire("Gagal", "SalesCampaign tidak dapat dihapus!", "error");
      }
    }
  };

  const handleChangeAdd = (value, name) => {
    setSalesCampaignDataAdd((prevState) => ({
      ...prevState,
      [name]: value instanceof Date ? value.toISOString() : value,
    }));
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      // Ensure all required fields are filled
      if (
        !salesCampaignDataAdd.campaign_name ||
        !salesCampaignDataAdd.rules ||
        !salesCampaignDataAdd.start_date ||
        !salesCampaignDataAdd.end_date ||
        !salesCampaignDataAdd.id_store ||
        !salesCampaignDataAdd.id_company ||
        !salesCampaignDataAdd.id_user ||
        !salesCampaignDataAdd.value
      ) {
        alert("Please fill all required fields.");
        return;
      }

      // Send product data to the backend
      const response = await client.post(
        "/salescampaign/addsalescampaign",
        {
          campaign_name: salesCampaignDataAdd.campaign_name,
          rules: salesCampaignDataAdd.rules,
          start_date: salesCampaignDataAdd.start_date,
          end_date: salesCampaignDataAdd.end_date,
          id_store: salesCampaignDataAdd.id_store,
          id_company: salesCampaignDataAdd.id_company,
          id_user: salesCampaignDataAdd.id_user,
          value: salesCampaignDataAdd.value,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("SalesCampaign added:", response.data);
      Swal.fire("Berhasil", "SalesCampaign berhasil ditambahkan!", "success");

      // Reload the page or update state
      // onClose();
      window.location.reload();
    } catch (error) {
      console.error("Error adding SalesCampaign:", error);
    }
  };

  useEffect(() => {
    if (salesCampaignToUpdate) {
      setSalesCampaignDataUpdate({
        id: salesCampaignToUpdate._id || "",
        campaign_name: salesCampaignToUpdate.campaign_name || "", // Menyimpan URL gambar lama
        rules: salesCampaignToUpdate.rules || "",
        start_date: salesCampaignToUpdate.start_date || "",
        end_date: salesCampaignToUpdate.end_date || "",
        id_store: salesCampaignToUpdate.id_store || "",
        id_company: salesCampaignToUpdate.id_company || "",
        id_user: salesCampaignToUpdate.id_user || "",
        value: salesCampaignToUpdate.value || "",
      });
    }
  }, [salesCampaignToUpdate]);

  const handleChangeUpdate = (value, name) => {
    setSalesCampaignDataUpdate((prevState) => ({
      ...prevState,
      [name]: value instanceof Date ? value.toISOString() : value, // 🔹 Hanya ubah `Date` ke ISO
    }));
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    for (const key in salesCampaignDataUpdate) {
      formData.append(key, salesCampaignDataUpdate[key]);
    }

    try {
      // const productId = "67a9615bf59ec80d10014871";
      const token = localStorage.getItem("token");
      const response = await client.put(
        `/api/salescampaign/${salesCampaignDataUpdate.id}`,
        {
          campaign_name: salesCampaignDataUpdate.campaign_name || "", // Menyimpan URL gambar lama
          rules: salesCampaignDataUpdate.rules || "",
          start_date: salesCampaignDataUpdate.start_date || "",
          end_date: salesCampaignDataUpdate.end_date || "",
          id_store: salesCampaignDataUpdate.id_store || "",
          id_company: salesCampaignDataUpdate.id_company || "",
          id_user: salesCampaignDataUpdate.id_user || "",
          value: salesCampaignDataUpdate.value || "",
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("SalesCampaign updated successfully:", response.data);
      // onClose();
      window.location.reload();
    } catch (error) {
      console.error("Error updating SalesCampaign:", error);
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
            <p className="text-2xl font-bold">Daftar Sales Campaign</p>
            <p>Detail Daftar Sales Campaign</p>
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
              + Tambah SalesCampaign
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          <div className="overflow-x-auto">
            {salesCampaign.length === 0 ? (
              <h1>Data produk tidak ditemukan!</h1>
            ) : (
              <table className="table w-full border border-gray-300">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Sales Campaign</th>
                    <th>Rules</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Value</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {salesCampaign.map((salesCampaign, index) => (
                    <tr key={salesCampaign._id}>
                      <td>{index + 1}</td>
                      <td>{salesCampaign.campaign_name}</td>
                      <td>{salesCampaign.rules}</td>
                      <td>{salesCampaign.start_date}</td>
                      <td>{salesCampaign.end_date}</td>
                      <td>{salesCampaign.value}</td>
                      <td className="flex space-x-4">
                        {" "}
                        {/* Beri jarak antar tombol */}
                        <button
                          className=" p-3 rounded-lg text-2xl "
                          onClick={() =>
                            deleteSalesCampaignById(salesCampaign._id)
                          }
                        >
                          <MdDelete />
                        </button>
                        <button
                          className=" p-3 rounded-lg text-2xl "
                          onClick={() =>
                            handleUpdateSalesCampaign(salesCampaign)
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
        <Modal onClose={closeModalAdd} title={"Tambah Sales Campaign"}>
          <form onSubmit={handleSubmitAdd}>
            <p className="font-semibold mt-4">Nama Sales Campaign</p>
            <input
              type="text"
              name="campaign_name"
              value={salesCampaignDataAdd.campaign_name}
              onChange={(e) => handleChangeAdd(e.target.value, e.target.name)}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4">Rules</p>
            <input
              type="text"
              name="rules"
              value={salesCampaignDataAdd.rules}
              onChange={(e) => handleChangeAdd(e.target.value, e.target.name)}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4">Start Date</p>
            {/* <DateTimePicker onChange={handleChangeAdd} value={salesCampaignDataAdd.start_date} name="start_date"></DateTimePicker> */}
            <DateTimePicker
              onChange={(date) => handleChangeAdd(date, "start_date")}
              value={
                salesCampaignDataAdd.start_date
                  ? new Date(salesCampaignDataAdd.start_date)
                  : null
              }
              name="start_date"
            />
            <p className="font-semibold mt-4">End Date</p>
            <DateTimePicker
              onChange={(date) => handleChangeAdd(date, "end_date")}
              value={
                salesCampaignDataAdd.end_date
                  ? new Date(salesCampaignDataAdd.end_date)
                  : null
              }
              minDate={
                salesCampaignDataAdd.start_date
                  ? new Date(salesCampaignDataAdd.start_date)
                  : null
              }
              name="end_date"
            />
            <p className="font-semibold mt-4 mb-2">Store</p>
            <select
              id="store"
              name="id_store"
              className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={salesCampaignDataAdd.id_store}
              onChange={(e) =>
                setSalesCampaignDataAdd((prevState) => ({
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
              value={salesCampaignDataAdd.id_company}
              onChange={(e) =>
                setSalesCampaignDataAdd((prevState) => ({
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
              value={salesCampaignDataAdd.id_user}
              onChange={(e) =>
                setSalesCampaignDataAdd((prevState) => ({
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
              value={salesCampaignDataAdd.value}
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
                // onClick={salesCampaignDataAdd}
                className="bg-blue-500 text-white p-2 rounded-lg"
              >
                Tambah
              </button>
            </div>
          </form>
        </Modal>
      )}
      {isUpdateModalOpen && (
        <Modal onClose={closeModalUpdate} title={"Edit Sales Campaign"}>
          <form onSubmit={handleSubmitUpdate}>
            <p className="font-semibold mt-4">Nama Sales Campaign</p>
            <input
              type="text"
              name="campaign_name"
              value={salesCampaignDataUpdate.campaign_name}
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
              value={salesCampaignDataUpdate.rules}
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
                salesCampaignDataUpdate.start_date
                  ? new Date(salesCampaignDataUpdate.start_date)
                  : null
              }
              name="start_date"
            />
            <p className="font-semibold mt-4">End Date</p>
            <DateTimePicker
              onChange={(date) => handleChangeUpdate(date, "end_date")}
              value={
                salesCampaignDataUpdate.end_date
                  ? new Date(salesCampaignDataUpdate.end_date)
                  : null
              }
              minDate={
                salesCampaignDataUpdate.start_date
                  ? new Date(salesCampaignDataUpdate.start_date)
                  : null
              }
              name="end_date"
            />
            <p className="font-semibold mt-4 mb-2">Store</p>
            <select
              id="store"
              name="id_store"
              className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={salesCampaignDataUpdate.id_store}
              onChange={(e) =>
                setSalesCampaignDataUpdate((prevState) => ({
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
              value={salesCampaignDataUpdate.id_company}
              onChange={(e) =>
                setSalesCampaignDataUpdate((prevState) => ({
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
              value={salesCampaignDataUpdate.id_user}
              onChange={(e) =>
                setSalesCampaignDataUpdate((prevState) => ({
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
              value={salesCampaignDataUpdate.value}
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

export default SalesCampaign;
