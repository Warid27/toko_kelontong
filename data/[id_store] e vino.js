<div className="flex flex-col">
  <div className="flex flex-row gap-3">
    {/* Gambar Produk */}
    <div className="max-h-72 max-w-72 min-w-64 rounded-xl flex justify-center p-3 border border-slate-300">
      <Image
        src={selectedProduct?.image || "https://placehold.co/100x100"}
        alt={selectedProduct?.name_product}
        width={200}
        height={200}
        className="object-contain"
      />
    </div>

    {/* Informasi Produk */}
    <div>
      <p className="text-xl font-bold">{selectedProduct?.name_product}</p>
      <p>{selectedProduct?.deskripsi}</p>
      <p className="hidden">{selectedProduct?.product_code}</p>
    </div>

    {/* Pilihan Extras */}
    <div>
      <p className="font-semibold mt-4 mb-2">Extras</p>
      <div className="flex flex-wrap space-x-2">
        {selectedProduct?.id_extras?.extrasDetails.map((extra) => (
          <button
            key={extra._id}
            className={`p-2 rounded-md ${
              selectedExtra === extra._id
                ? "bg-[#FDDC05] text-black font-semibold"
                : "bg-white border-[#FDDC05] border-2"
            }`}
            onClick={() => setSelectedExtra(extra._id)}
          >
            {extra.name}
          </button>
        ))}
      </div>
    </div>

    {/* Pilihan Ukuran */}
    <div>
      <p className="font-semibold mt-4 mb-2">Size</p>
      <div className="flex flex-wrap space-x-2">
        {selectedProduct?.id_size?.sizeDetails.map((size) => (
          <button
            key={size._id}
            className={`p-2 rounded-md ${
              selectedSize === size._id
                ? "bg-[#FDDC05] text-black font-semibold"
                : "bg-white border-[#FDDC05] border-2"
            }`}
            onClick={() => setSelectedSize(size._id)}
          >
            {size.name}
          </button>
        ))}
      </div>
    </div>
  </div>

  {/* Kontrol Jumlah Produk */}
  <div className="flex items-center justify-center mt-4">
    <button
      onClick={() => setQuantity(Math.max(1, quantity - 1))}
      className="py-2 px-3 border border-black rounded-md"
    >
      <FaMinus />
    </button>
    <input
      type="number"
      min={1}
      step={1}
      value={quantity}
      onChange={(e) => setQuantity(Number(e.target.value))}
      className="mx-4 w-16 text-center bg-transparent border-none focus:outline-none focus:border-b focus:border-black spinner-none"
    />
    <button
      onClick={() => setQuantity(quantity + 1)}
      className="py-2 px-3 border border-black rounded-md"
      disabled={quantity >= selectedProduct?.id_stock?.amount}
    >
      <FaPlus />
    </button>
  </div>

  {/* Peringatan Stok */}
  {quantity >
    (selectedProduct?.id_stock?.amount || 0) -
      (selectedProduct?.orderQty || 0) && (
    <p className="text-red-500 mt-2">
      Stok produk ini hanya{" "}
      {(selectedProduct?.id_stock?.amount || 0) -
        (selectedProduct?.orderQty || 0)}
    </p>
  )}

  {/* Tombol Tambah ke Keranjang */}
  <button
    onClick={addToCart}
    className={`mt-4 w-full p-2 rounded-md ${
      quantity === 0 ||
      quantity >
        (selectedProduct?.id_stock?.amount - (selectedProduct?.orderQty || 0) ||
          0)
        ? "closeBtn"
        : "addBtn"
    }`}
    disabled={
      quantity === 0 ||
      quantity >
        (selectedProduct?.id_stock?.amount - (selectedProduct?.orderQty || 0) ||
          0)
    }
  >
    Tambah ke Keranjang
  </button>
</div>;
