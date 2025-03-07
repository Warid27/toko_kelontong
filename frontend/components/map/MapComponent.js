"use client";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const MapComponent = dynamic(
  () => import("./ActualMapComponent"), // Import the actual map component dynamically
  { ssr: false } // Disable SSR to prevent window reference errors
);

export default MapComponent;
