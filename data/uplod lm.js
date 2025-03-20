<div>
  <button
    onClick={() => {
      modalOpen("add", false);
      modalOpen("example", true);
    }}
  >
    example
  </button>
  <h1 className="text-lg font-semibold text-gray-800 text-center mb-2">
    Upload Excel & Folder Gambar
  </h1>
  <div className="upload-container">
    <label className="upload-label">
      <input
        type="file"
        accept=".xlsx, .xls, .csv"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      {file && <p>File dipilih: {file.name}</p>}
      <div className="upload-content">
        {file ? (
          <div className="bg-[#F8FAFC] w-28 rounded-lg p-3 flex flex-col items-center justify-center">
            <IoIosCloudDone className="text-5xl text-[#FDDC05]" />
            <p className="text-sm text-[#FDDC05]">File Uploaded</p>
          </div>
        ) : (
          <div className="bg-[#F8FAFC] w-28 rounded-lg p-3 flex flex-col items-center justify-center">
            <FaFileUpload className="text-5xl text-[#FDDC05]" />
            <p className="text-sm text-[#FDDC05]">New File</p>
          </div>
        )}
      </div>
    </label>
  </div>
  <div className="upload-container mt-4">
    <label className="upload-label">
      <input
        type="file"
        webkitdirectory=""
        directory=""
        multiple
        onChange={handleFolderChange}
        style={{ display: "none" }}
      />
      {folder ? (
        <p>{folder.length} file gambar dipilih</p>
      ) : (
        <p>Pilih folder gambar</p>
      )}
    </label>
  </div>
  <button onClick={handleProductBatch} className="addBtn mt-4">
    Upload
  </button>
</div>;
