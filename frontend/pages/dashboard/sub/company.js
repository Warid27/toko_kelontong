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
import Select from "react-select";
import { fetchTypeList } from "@/libs/fetching/type";
import { fetchCompanyList } from "@/libs/fetching/company";
import ReactPaginate from "react-paginate";

const CompanyData = () => {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companyToUpdate, setCompanyToUpdate] = useState(null); // Untuk menyimpan produk yang akan diupdate
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // Untuk mengontrol tampilan modal update
  const [loading, setLoading] = useState(false); // Untuk loading saat update status
  const [typeList, setTypeList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

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
      const get_type_list = async () => {
        const data_type = await fetchTypeList();
        setTypeList(data_type);
        setIsLoading(false)
      };
      const get_company_list = async () => {
        const data_company = await fetchCompanyList();
        setCompanies(data_company);
        setIsLoading(false)
      };
      get_type_list();
      get_company_list();
    };
    fetching_requirement();
  }, []);

  const handleStatusSelect = async (companyId, selectedStatus) => {
    try {
      setLoading(true);

      const response = await client.put(`/api/company/${companyId}`, {
        status: selectedStatus,
      });

      console.log("Response from API:", response.data);

      setCompanies((prevCompanies) =>
        prevCompanies.map((company) =>
          company._id === companyId
            ? { ...company, status: selectedStatus }
            : company
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCompany = (company, params) => {
    setCompanyToUpdate(company); // Menyimpan produk yang dipilih
    modalOpen(params, true);
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

      modalOpen("add", false);

      Swal.fire("Berhasil", "Company berhasil ditambahkan!", "success");

      setCompanies((prevCompanies) => [...prevCompanies, response.data]);
    } catch (error) {
      console.error("Error adding Company:", error);
    }
  };

  useEffect(() => {
    if (companyToUpdate) {
      setCompaniesDataUpdate({
        id: companyToUpdate._id || "",
        name: companyToUpdate.name || "", // Menyimpan URL gambar lama
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
      modalOpen("update", false);
      Swal.fire("Berhasil", "Company berhasil diupdate!", "success");

      setCompanies((prevCompanies) =>
        prevCompanies.map((companies) =>
          companies._id === companiesDataUpdate.id ? response.data : companies
        )
      );
    } catch (error) {
      console.error("Error updating Company:", error);
    }
  };

  const startIndex = currentPage * itemsPerPage;
  const selectedData = companies.slice(startIndex, startIndex + itemsPerPage);


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
              <option value="">Best sellers</option>
              <option value="">Ricebowl</option>
              <option value="">Milkshake</option>
            </select>
          </div>
          <div>
            <button className="addBtn" onClick={() => modalOpen("add", true)}>
              + Tambah Company
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 mt-4">
        <div className="bg-white rounded-lg">
          <div>
            {companies.length === 0 ? (
              <h1>Data produk tidak ditemukan!</h1>
            ) : (
              <>
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
                  {selectedData.map((company, index) => (
                    <tr key={company._id}>
                      <td>{startIndex + index + 1}</td>
                      <td>{company.name}</td>
                      <td>{company.address}</td>
                      <td>
                        <select
                          className="select bg-white"
                          value={company.status}
                          onChange={(e) =>
                            handleStatusSelect(
                              company._id,
                              Number(e.target.value)
                            )
                          }
                        >
                          <option value={0}>Active</option>
                          <option value={1}>Inactive</option>
                          <option value={2}>Bankrupt</option>
                          {/* Tambahkan opsi lain jika diperlukan di masa depan */}
                        </select>
                      </td>
                      <td>
                        <button
                          className=" p-3 rounded-lg text-2xl "
                          onClick={() => deleteCompanyById(company._id)}
                        >
                          <MdDelete />
                        </button>
                        <button
                          className=" p-3 rounded-lg text-2xl "
                          onClick={() => handleUpdateCompany(company, "update")}
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
                pageCount={Math.ceil(selectedData.length / itemsPerPage)}
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
          title={"Tambah Perusahaan"}
        >
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
            <p className="font-semibold mt-4 mb-2">Type</p>
            <Select
              id="type"
              className="basic-single"
              options={typeList.map((c) => ({
                value: c._id,
                label: c.type,
              }))}
              value={
                typeList
                  .map((c) => ({ value: c._id, label: c.type }))
                  .find((opt) => opt.value === companiesDataAdd.id_type) || null
              }
              onChange={(selectedOption) =>
                setCompaniesDataAdd((prevState) => ({
                  ...prevState,
                  id_type: selectedOption ? selectedOption.value : "",
                }))
              }
              isSearchable
              required
              placeholder="Pilih Type..."
              noOptionsMessage={() => "No Type available"}
            />
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
                onClick={() => modalOpen("add", false)}
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
        <Modal
          onClose={() => modalOpen("update", false)}
          title={"Edit Perusahaan"}
        >
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
            <p className="font-semibold mt-4 mb-2">Type</p>
            <Select
              id="type"
              className="basic-single"
              options={typeList.map((c) => ({
                value: c._id,
                label: c.type,
              }))}
              value={
                typeList
                  .map((c) => ({ value: c._id, label: c.type }))
                  .find((opt) => opt.value === companiesDataUpdate.id_type) ||
                null
              }
              onChange={(selectedOption) =>
                setCompaniesDataAdd((prevState) => ({
                  ...prevState,
                  id_type: selectedOption ? selectedOption.value : "",
                }))
              }
              isSearchable
              required
              placeholder="Pilih Type..."
              noOptionsMessage={() => "No Type available"}
            />
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
              <button
                type="button"
                className="closeBtn"
                onClick={() => modalOpen("update", false)}
              >
                Batal
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

export default CompanyData;
