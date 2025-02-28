{
  // FETCH PAYMENT
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await client.post("/payment/listpayment", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Flatten the paymentName arrays into a single list
        const flattenedPayments = response.data.flatMap((paymentType) =>
          paymentType.paymentName.map((payment) => ({
            ...payment,
            payment_method: paymentType.payment_method,
          }))
        );

        setPayments(flattenedPayments);
      } catch (error) {
        console.error("Error fetching payments:", error);
        setError("Failed to load payment methods. Please try again later.");
      }
    };
    fetchPayments();
  }, []);

  const [payment, SetPayment] = useState({
    bayar: "",
  });

  // Payment
  // Group payments by payment_method
  const groupedPayments = payments.reduce((acc, payment) => {
    if (!acc[payment.payment_method]) {
      acc[payment.payment_method] = [];
    }
    acc[payment.payment_method].push(payment);
    return acc;
  }, {});

  // Toggle payments expansion
  const togglePayments = (payments) => {
    setexpandedPayments((prev) => ({
      ...prev,
      [payments]: !prev[payments],
    }));
  };
}
{
  isPayModalOpen && (
    <Modal onClose={() => modalOpen("pay", false)} title={"Pembayaran"}>
      {/* bg-opacity dan blur biar gak ngelag */}
      <div className="bg-opacity-100">
        {/* Ringkasan Belanja */}

        <div className="border rounded-lg mb-4 shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
          <div className="bg-orange-500 text-white p-3 rounded-t-lg font-bold">
            Ringkasan Belanja
          </div>
          <div className="p-4">
            {/* Header Produk - Qty - Harga */}
            <div className="flex justify-between text-gray-500 font-semibold text-sm pb-2 border-b border-gray-300">
              <p className="w-1/2">Produk</p>
              <p className="w-1/4 text-center">Qty</p>
              <p className="w-1/4 text-right">Harga</p>
            </div>
            {/* Daftar Produk */}
            {cartItems.map((item, index) => (
              <div key={index} className="flex justify-between py-2">
                <p className="w-1/2 font-semibold">{item.product.name}</p>
                <p className="w-1/4 text-center">{item.quantity}</p>
                <p className="w-1/4 text-right font-semibold">
                  Rp {item.product.price.toLocaleString()}
                </p>
              </div>
            ))}

            {/* Biaya Kirim */}
            <div className="flex justify-between text-green-500 font-semibold mt-2">
              <p>Jumlah Item</p>
              <p>{cartItems.length}</p>
            </div>

            {/* Biaya Kirim */}
            <div className="flex justify-between text-green-500 font-semibold mt-2">
              <p>Biaya Kirim</p>
              <p>0</p>
            </div>

            {/* Border dashed line */}
            <div className="border-b border-dashed border-gray-300 my-2"></div>

            {/* Total Harga */}
            <div className="flex justify-between font-bold text-lg mt-3">
              <p className="text-black">Total Harga</p>
              <p className="text-orange-500">
                Rp.{" "}
                {cartItems
                  .reduce(
                    (total, item) => total + item.quantity * item.product.price,
                    0
                  )
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Pilih Metode Pembayaran */}
        <div className="border rounded-lg mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
          <div className="bg-orange-500 text-white p-3 rounded-t-lg font-bold">
            Pilih Metode Pembayaran
          </div>
          <div className="p-2 space-y-1">
            {Object.keys(groupedPayments).map((payments) => (
              <div key={payments}>
                {/* Payments Header */}
                <div
                  className="flex items-center justify-between cursor-pointer p-2 bg-gray-100 rounded-md hover:bg-gray-200"
                  onClick={() => togglePayments(payments)}
                >
                  <span className="font-semibold">{payments}</span>
                  <span
                    className={`transition-transform duration-200 ${
                      expandedPayments[payments] ? "rotate-180" : ""
                    }`}
                  >
                    <IoIosArrowDropdown />
                  </span>
                </div>

                {/* Payment Methods (Dropdown Content) */}
                {expandedPayments[payments] && (
                  <div className="pl-4 mt-2 space-y-2">
                    {groupedPayments[payments].map((payment) => (
                      <label
                        key={payment._id}
                        className="flex items-center cursor-pointer w-full p-2 gap-3 rounded-md hover:bg-orange-50 peer-checked:bg-orange-50"
                      >
                        <div className="relative w-6 h-6 flex items-center justify-center">
                          <div className="absolute w-5 h-5 bg-white rounded-full border-2 border-gray-400"></div>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={payment._id}
                            checked={selectedMethod?._id === payment._id}
                            onChange={() => setSelectedMethod(payment)}
                            className="peer relative w-5 h-5 rounded-full border-2 border-gray-400 appearance-none checked:border-orange-500 transition-all duration-200"
                            aria-label={payment.payment_name}
                          />
                          <div className="absolute w-3 h-3 bg-orange-500 rounded-full scale-0 peer-checked:scale-100 transition-all duration-200"></div>
                        </div>
                        <div className="flex items-center justify-center gap-5">
                          <img
                            src={payment.image}
                            alt={`${payment.payment_name} logo`}
                            className="object-contain w-8 h-8"
                          />
                          <span>{payment.payment_name}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Kupon Promo */}
        <div className="border rounded-lg shadow-md overflow-hidden">
          <div className="bg-orange-500 text-white p-3 font-bold">
            Kupon Promo
          </div>
          <div className="p-4">
            <input
              type="text"
              placeholder="Masukkan kode promo"
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-black placeholder-gray-400 outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </div>

        {/* Tombol Bayar dan Makan di Tempat */}
        <div className="flex flex-col gap-3 mt-4">
          <button
            className="w-full py-3 rounded-md font-bold text-white bg-[#642416] hover:bg-[#4e1b10] transition-all"
            onClick={handleButtonClick}
          >
            BAYAR
          </button>
          <button
            className="w-full py-3 rounded-md font-bold text-black bg-[#fddc05] hover:bg-[#e6c304] transition-all"
            onClick={handleButtonClick}
          >
            Makan di Tempat
          </button>
        </div>
      </div>
    </Modal>
  );
}
