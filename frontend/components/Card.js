import React from "react";
import Image from "next/image";

const Card = ({ lebar, tinggi, onClick, image, harga, nama }) => {
  return (
    <div
      className={`card bg-base-100 w-${lebar || "80"}
      } shadow-xl cursor-pointer overflow-hidden`}
      onClick={onClick}
    >
      <figure className="w-full h-48 flex items-center justify-center bg-gray-100">
        <Image
          src={image}
          alt="Product"
          width={tinggi ||100}
          height={lebar ||100}
          className="object-contain w-full h-full"
        />
      </figure>
      <div className="card-body bg-white p-4 text-center">
        <h2 className="card-title text-lg font-semibold">{nama}</h2>
        <p className="font-bold text-gray-700">{harga}</p>
      </div>
    </div>
  );
};

export default Card;
