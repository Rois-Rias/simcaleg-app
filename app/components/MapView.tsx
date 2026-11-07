"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";

export type MapPoint = {
  id: number;
  nama: string;
  alamat: string | null;
  status: string | null;
  lat: number;
  lng: number;
  dummy: boolean;
};

export default function MapView({ points }: { points: MapPoint[] }) {
  const center: [number, number] = [-6.9147, 107.6098]; // Bandung

  return (
    <MapContainer
      center={center}
      zoom={11}
      scrollWheelZoom
      style={{ height: "440px", width: "100%", borderRadius: "0.5rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {points.map((p) => (
        <CircleMarker
          key={p.id}
          center={[p.lat, p.lng]}
          radius={8}
          pathOptions={{
            color: p.dummy ? "#f59e0b" : "#1e40af",
            fillColor: p.dummy ? "#fbbf24" : "#3b82f6",
            fillOpacity: 0.75,
            weight: 2,
          }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold text-blue-900">{p.nama}</p>
              <p className="text-gray-600">{p.alamat ?? "-"}</p>
              <p className="mt-1 text-xs text-gray-500">
                Status: {p.status ?? "-"}
              </p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}