"use client";

import { useRef, useEffect } from "react";
import JsBarcode from "jsbarcode";

export default function BarcodeGenerator({ barcode }) {
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current && barcode) {
      JsBarcode(barcodeRef.current, barcode, {
        format: "CODE128",
        displayValue: true,
      });
    }
  }, [barcode]);

  return (
    <div className="flex flex-col items-center gap-4 p-5">
      <svg ref={barcodeRef}></svg>
      {/* <p>{barcode}</p> */}
    </div>
  );
}
