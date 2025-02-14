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

const CompanyData = () => {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [companyToUpdate, setCompanyToUpdate] = useState(null); // Untuk menyimpan produk yang akan diupdate
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // Untuk mengontrol tampilan modal update
  const [loading, setLoading] = useState(false); // Untuk loading saat update status
  const [typeList, setTypeList] = useState([]);

  const [companiesDataAdd, setCompaniesDataAdd] = useState({
    name: "",
    address: "",
    id_type: "",
    status: "",
    phone: "",
    email: "",
  });

  const [companiesDataUpdate, setCompaniesDataUpdate] = useState({
    id: "",
    name: "",
    address: "",
    id_type: "",
    status: "",
    phone: "",
    email: "",
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

  // const addNewCompany = (newCompany) => {
  //   setCompanies((prevCompanys) => [...prevCompanys, newCompany]);
  // };

  useEffect(() => {
    const fetchType = async () => {
      try {
        const response = await client.get("/type/listtype");
        const data = response.data;

        // Validate that the response is an array
        if (!Array.isArray(data)) {
          console.error(
            "Unexpected data format from /type/listtype:",
            data
          );
          setTypeList([]);
        } else {
          setTypeList(data);
        }
      } catch (error) {
        console.error("Error fetching type:", error);
        setTypeList([]);
      }
    };
    fetchType();
  }, []);

  const handleStatus = async (companyId, currentStatus) => {
    try {
      setLoading(true);

      const newStatus = currentStatus === 0 ? 1 : 0;

      const response = await client.put(`/api/company/${companyId}`, {
        status: newStatus === 0 ? 0 : 1,
      });

      console.log("Response from API:", response.data);

      setCompanies((prevCompanys) =>
        prevCompanys.map((company) =>
          company._id === companyId 
            ? { ...company, status: newStatus }
            : company
        )
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchCompanys = async () => {
      try {
        const token = localStorage.getItem("token");
        const id_store = localStorage.getItem("id_store");

        if (!id_store) {
          console.error("id_store is missing in localStorage");
          setIsLoading(false);
          return;
        }

        const response = await client.post(
          "/company/listcompany",
          { id_store }, // Pass id_store in the request body
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Set the fetched companies into state
        setCompanies(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching companies:", error);
        setIsLoading(false);
      }
    };

    fetchCompanys();
  }, []);

  // const handleAddCompany = () => {
  //   setIsModalOpen(true);
  // };

  const handleUpdateCompany = (company) => {
    setCompanyToUpdate(company); // Menyimpan produk yang dipilih
    setIsUpdateModalOpen(true);

    console.log(company);
  };

  const deleteCompanyById = async (id) => {
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
        const response = await client.delete(`/api/company/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          Swal.fire("Berhasil", "Company berhasil dihapus!", "success");
          setCompanies((prevCompanys) =>
            prevCompanys.filter((p) => p._id !== id)
          );
        }
      } catch (error) {
        console.error("Gagal menghapus Company:", error.message);
        Swal.fire("Gagal", "Company tidak dapat dihapus!", "error");
      }
    }
  };

  const handleChangeAdd = (e) => {
    const { name, value } = e.target;
    setCompaniesDataAdd((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      // Ensure all required fields are filled
      if (
        !companiesDataAdd.name ||
        !companiesDataAdd.address ||
        !companiesDataAdd.phone ||
        !companiesDataAdd.email
      ) {
        alert("Please fill all required fields.");
        return;
      }

      // Send product data to the backend
      const response = await client.post(
        "/company/addcompany",
        {
          name: companiesDataAdd.name,
          address: companiesDataAdd.address,
          id_type: companiesDataAdd.id_type,
          status: 1,
          phone: companiesDataAdd.phone,
          email: companiesDataAdd.email,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Company added:", response.data);
      Swal.fire("Berhasil", "Company berhasil ditambahkan!", "success");

      // Reload the page or update state
      // onClose();
      window.location.reload();
    } catch (error) {
      console.error("Error adding Company:", error);
    }
  };

  useEffect(() => {
    if (companyToUpdate) {
      setCompaniesDataUpdate({
        id: companyToUpdate._id || "",
        name: companyToUpdate.name|| "", // Menyimpan URL gambar lama
        address: companyToUpdate.address || "",
        id_type: companyToUpdate.id_type || "",
        status: companyToUpdate.status || "",
        phone: companyToUpdate.phone || "",
        email: companyToUpdate.email || "",
      });
    }
  }, [companyToUpdate]);

  const handleChangeUpdate = (e) => {
    const { name, value } = e.target;
    setCompaniesDataUpdate((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    for (const key in companiesDataUpdate) {
      formData.append(key, companiesDataUpdate[key]);
    }

    try {
      // const productId = "67a9615bf59ec80d10014871";
      const token = localStorage.getItem("token");
      const response = await client.put(
        `/api/company/${companiesDataUpdate.id}`,
        {
          name: companiesDataUpdate.name,
          address: companiesDataUpdate.address,
          id_type: companiesDataUpdate.id_type,
          status: companiesDataUpdate.status,
          phone: companiesDataUpdate.phone,
          email: companiesDataUpdate.email,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Company updated successfully:", response.data);
      // onClose();
      window.location.reload();
    } catch (error) {
      console.error("Error updating Company:", error);
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
            <p className="text-2xl font-bold">Daftar Perusahaan</p>
            <p>Detail Daftar Perusahaan</p>
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
              + Tambah Company
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          <div className="overflow-x-auto">
            {companies.length === 0 ? (
              <h1>Data produk tidak ditemukan!</h1>
            ) : (
              <table className="table w-full border border-gray-300">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Perusahaan</th>
                    <th>Alamat</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company, index) => (
                    <tr key={company._id}>
                      <td>{index + 1}</td>
                      <td>{company.name}</td>
                      <td>{company.address}</td>
                      <td>
                        <input
                          type="checkbox"
                          className="toggle"
                          checked={company.status === 0}
                          onChange={() =>
                            handleStatus(company._id, company.status)
                          }
                        />
                      </td>
                      <td className="flex space-x-4">
                        {" "}
                        {/* Beri jarak antar tombol */}
                        <button
                          className=" p-3 rounded-lg text-2xl "
                          onClick={() => deleteCompanyById(company._id)}
                        >
                          <MdDelete />
                        </button>
                        <button
                          className=" p-3 rounded-lg text-2xl "
                          onClick={() => handleUpdateCompany(company)}
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
        <Modal onClose={closeModalAdd} title={"Tambah Perusahaan"}>
          <form onSubmit={handleSubmitAdd}>
            <p className="font-semibold mt-4">Nama Perusahaan</p>
            <p className="mb-2 text-sm text-slate-500">
              Include min. 40 characters to make it more interesting
            </p>
            <input
              type="text"
              name="name"
              value={companiesDataAdd.name}
              onChange={handleChangeAdd}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4">Address company</p>
            <p className="mb-2 text-sm text-slate-500">
              Include min. 260 characters to make it easier for buyers to
              understand and find your product
            </p>
            <textarea
              name="address"
              value={companiesDataAdd.address}
              onChange={handleChangeAdd}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4 mb-2">Type Perusahaan</p>
            <select
              id="company"
              name="id_type"
              className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={companiesDataAdd.id_type}
              onChange={(e) =>
                setCompaniesDataAdd((prevState) => ({
                  ...prevState,
                  id_type: e.target.value,
                }))
              }
              required
            >
              <option value="" disabled>
                === Pilih Type ===
              </option>

              {typeList.length === 0 ? (
                <option value="default">No type available</option>
              ) : (
                typeList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.type}
                  </option>
                ))
              )}
            </select>
            <p className="font-semibold mt-4 mb-2">Phone</p>
            <input
              type="text"
              name="phone"
              value={companiesDataAdd.phone}
              onChange={handleChangeAdd}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4 mb-2">Email</p>
            <input
              type="text"
              name="email"
              value={companiesDataAdd.email}
              onChange={handleChangeAdd}
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
                className="bg-blue-500 text-white p-2 rounded-lg"
              >
                Tambah
              </button>
            </div>
          </form>
        </Modal>
      )}
      {isUpdateModalOpen && (
        <Modal onClose={closeModalUpdate} title={"Edit Perusahaan"}>
          <form onSubmit={handleSubmitUpdate}>
            
            <p className="font-semibold mt-4">Nama Perusahaan</p>
            <input
              type="text"
              name="name"
              value={companiesDataUpdate.name}
              onChange={handleChangeUpdate}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4 mb-2">Address Perusahaan</p>
            <input
              type="text"
              name="stock"
              value={companiesDataUpdate.address}
              onChange={handleChangeUpdate}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4 mb-2">Type Perusahaan</p>
            <select
              id="company"
              className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={companiesDataUpdate.id_type}
              onChange={(e) =>
                setCompaniesDataUpdate((prevState) => ({
                  ...prevState,
                  id_type: e.target.value,
                }))
              }
              required
            >
              <option value="" disabled>
                === Pilih Type ===
              </option>

              {typeList.length === 0 ? (
                <option value="default">No companies available</option>
              ) : (
                typeList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.type}
                  </option>
                ))
              )}
            </select>
            <p className="font-semibold mt-4 mb-2">Phone</p>
            <input
              type="text"
              name="phone"
              value={companiesDataUpdate.phone}
              onChange={handleChangeUpdate}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <p className="font-semibold mt-4 mb-2">Email</p>
            <input
              type="text"
              name="email"
              value={companiesDataUpdate.email}
              onChange={handleChangeUpdate}
              className="border rounded-md p-2 w-full bg-white"
              required
            />
            <div className="flex justify-end mt-4">
              {/* <button
              type="button"
              className="mr-2 bg-gray-400 text-white p-2 rounded-lg"
              onClick={onClose}
            >
              Batal
            </button> */}
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

export default CompanyData;
