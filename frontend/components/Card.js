import React from "react";
import Image from "next/image";

const Card = ({
  lebar,
  tinggi,
  onClick,
  image,
  harga,
  hargaDiskon,
  nama,
  diskon,
  stock,
}) => {
  return (
    <div
      className={`card bg-base-100 w-${lebar || "80"}
      } shadow-xl cursor-pointer overflow-hidden relative`}
      onClick={onClick}
    >
      {diskon > 0 && diskon <= 1 && (
        <div className="absolute -top-12 -right-12  bg-red-500 text-white w-32 h-32 rounded-full font-bold justify-start flex items-end">
          <p className="ps-6 pb-6 w-5 text-center">{diskon * 100}% OFF!</p>
        </div>
      )}
      <figure className="w-full h-48 flex items-center justify-center bg-green-300">
        <Image
          src={image}
          alt="Product"
          width={tinggi || 100}
          height={lebar || 100}
          className="object-fill w-full h-full"
        />
      </figure>
      <div className="card-body bg-white p-4 text-left">
        {stock === 0 && stock < 1 && (
          <p className="font-bold text-red-500">Produk Habis</p>
        )}
        <h2 className="card-title text-lg font-semibold">{nama}</h2>
        {hargaDiskon && (
          <p className="font-bold text-sm text-red-500 line-through">
            {hargaDiskon}
          </p>
        )}
        <p className="font-bold text-gray-700">{harga}</p>
      </div>
    </div>
  );
};

export default Card;
