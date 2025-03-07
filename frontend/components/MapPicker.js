"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

import "leaflet/dist/leaflet.css";

const DynamicMap = dynamic(() => import("@/components/map/MapComponent"), {
  ssr: false,
});

const MapPicker = ({ value, onChange, name}) => {
  const [position, setPosition] = useState([-6.2088, 106.8456]);

  useEffect(() => {
    if (value) {
      setPosition(value);
    }
  }, [value]);

  return (
    <>
      <DynamicMap value={position} onChange={onChange} name={name} />
    </>
  );
};

export default MapPicker;
