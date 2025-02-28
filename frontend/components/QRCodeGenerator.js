import QRCode from "react-qr-code";

const QRCodeGenerator = ({ id_store, id_company }) => {
  const qrUrl = `http://localhost:8000/product/${id_store}?id_company=${id_company}`;

  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded-lg shadow">
      <QRCode value={qrUrl} size={200} />
      <p className="text-lg font-semibold">Scan QR untuk membuka </p>
      <p className="text-sm text-gray-500 text-center">{qrUrl}</p>
    </div>
  );
};

export default QRCodeGenerator;
