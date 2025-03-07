import React, { useEffect, useState } from "react";
import { PiShoppingCartSimpleBold } from "react-icons/pi";
import { FiLogIn } from "react-icons/fi";
import { useRouter } from "next/router";
import Image from "next/image";

const Topbar = ({ onCartUpdate, homePage = false }) => {
  const router = useRouter();
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    if (!homePage) {
      const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
      setCartItemCount(cartItems.length);
    }
  }, [homePage]);

  useEffect(() => {
    if (!homePage && onCartUpdate) {
      const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
      setCartItemCount(cartItems.length);
    }
  }, [homePage, onCartUpdate]);

  return (
    <div className="bg-[var(--bg-primary)] px-8 py-3 shadow-lg flex flex-row justify-between items-center">
      <button
        className="relative flex overflow-hidden w-12 h-12 rounded-full border-2 border-white"
        onClick={() => router.push("/")}
      >
        <Image
          src="/icon_kelontong.svg"
          alt="storeIcon"
          width={48}
          height={48}
          className="object-cover"
        />
      </button>
      {!homePage && (
        <div className="space-x-2">
          <button
            className="btn btn-ghost rounded-lg btn-sm relative"
            onClick={() => router.push("/cart")}
          >
            <PiShoppingCartSimpleBold className="text-lg" />
            {cartItemCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
                {cartItemCount}
              </span>
            )}
          </button>
          <button
            className="btn btn-ghost rounded-lg btn-sm relative"
            onClick={() => router.push("/login")}
          >
            <FiLogIn className="text-lg" /> Login
          </button>
        </div>
      )}
    </div>
  );
};

export default Topbar;
