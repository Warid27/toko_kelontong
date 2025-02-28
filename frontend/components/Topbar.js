import React, { useEffect, useState } from "react";
import { PiShoppingCartSimpleBold } from "react-icons/pi";
import { FiLogIn } from "react-icons/fi";
import { useRouter } from "next/router";

const Topbar = ({ onCartUpdate }) => {
  const router = useRouter();
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
    setCartItemCount(cartItems.length);
  }, []);

  useEffect(() => {
    if (onCartUpdate) {
      const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
      setCartItemCount(cartItems.length);
    }
  }, [onCartUpdate]);

  return (
    <div className="bg-[#24D164] px-8 py-3 shadow-lg flex flex-row justify-between">
      <button
        className="btn btn-ghost rounded-lg btn-sm relative"
        onClick={() => router.push("/")}
      >
        Kasir
      </button>
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
    </div>
  );
};

export default Topbar;
