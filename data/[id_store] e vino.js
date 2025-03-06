import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="bg-yellow-500 py-4 px-6 flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">Selamat Datang</h1>
        <input
          type="text"
          placeholder="Search Food"
          className="px-3 py-1 rounded"
        />
      </header>
      {/* Banner */}
      <section className="relative bg-brown-500 text-white text-center py-16">
        <h2 className="text-3xl font-bold">Di website Cafeku</h2>
      </section>
      {/* Promo Section */}
      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">PROMO</h2>
        <Card className="w-60">
          <CardContent className="p-4">
            <Image
              src="/promo-kopi.jpg"
              width={200}
              height={200}
              alt="Kopi Luwak"
            />
            <h3 className="text-lg font-semibold">Kopi Luwak</h3>
            <p className="text-red-500 font-bold">Rp 70.000</p>
          </CardContent>
        </Card>
      </div>
      {/* Minuman Section */}
      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Minuman</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["Americano", "Produk", "Kopi Jawa", "Produk"].map((item, index) => (
            <Card key={index} className="w-60">
              <CardContent className="p-4">
                <Image src="/minuman.jpg" width={200} height={200} alt={item} />
                <h3 className="text-lg font-semibold">{item}</h3>
                <p className="font-bold">Rp 70.000</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {/* Makanan Section */}
      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Makanan</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["Nasi Goreng", "Produk", "Produk", "Produk"].map((item, index) => (
            <Card key={index} className="w-60">
              <CardContent className="p-4">
                <Image src="/makanan.jpg" width={200} height={200} alt={item} />
                <h3 className="text-lg font-semibold">{item}</h3>
                <p className="font-bold">Rp 70.000</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {/* Snack Section */}
      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Snack</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["Produk", "Produk", "Produk"].map((item, index) => (
            <Card key={index} className="w-60">
              <CardContent className="p-4">
                <Image src="/snack.jpg" width={200} height={200} alt={item} />
                <h3 className="text-lg font-semibold">{item}</h3>
                <p className="font-bold">Rp 70.000</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {/* Footer */}
      <footer className="bg-yellow-500 text-white text-center py-4 mt-6">
        <p>Copyright © 2024 Carakan. All rights reserved</p>
      </footer>
    </div>
  );
}
