"use client";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";

const customIcon = L.icon({
  iconUrl: "/map-marker.png", // Path to your marker image
  iconSize: [32, 32], // Size of the icon
  iconAnchor: [16, 32], // Positioning of the icon anchor
  popupAnchor: [0, -32], // Adjust popup position if needed
});

const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
};

const MapClickHandler = ({ setPosition, onChange, name }) => {
  useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      onChange({ target: { name, value: newPos.join(",") } }); // Kirim perubahan ke form
    },
  });
  return null;
};

const ActualMapComponent = ({ value, onChange, name }) => {
  const [position, setPosition] = useState([-6.2088, 106.8456]);

  useEffect(() => {
    if (value) {
      if (typeof value === "string") {
        const parsedValue = value.split(",").map(Number);
        if (
          parsedValue.length === 2 &&
          parsedValue.every((num) => !isNaN(num))
        ) {
          setPosition(parsedValue);
        }
      } else if (Array.isArray(value)) {
        setPosition(value);
      }
    }
  }, [value]);

  return (
    <>
      <textarea
        name={name}
        value={position.join(",")}
        onChange={onChange}
        className="border rounded-md p-2 w-full bg-white"
        required
        readOnly
      />
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: "200px", width: "100%" }}
      >
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.jpg"
          minZoom={0}
          maxZoom={20}
          attribution="&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href='https://www.stadiamaps.com/' target='_blank'>Stadia Maps</a> &copy; <a href='https://openmaptiles.org/' target='_blank'>OpenMapTiles</a> &copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
        />
        <RecenterMap position={position} />
        <MapClickHandler
          setPosition={setPosition}
          onChange={onChange}
          name={name}
        />
        <Marker position={position} icon={customIcon} />
      </MapContainer>
    </>
  );
};

export default ActualMapComponent;
