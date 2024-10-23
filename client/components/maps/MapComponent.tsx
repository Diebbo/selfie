"use client";
import React, { useRef, useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css"; // Re-uses images from ~leaflet package
import * as L from "leaflet";
import "leaflet-defaulticon-compatibility";

import { MapEvent } from "@/actions/maps";
import { Friend } from "./content";

interface MapComponentProps {
  filter: "all" | "events" | "friends";
  events: MapEvent[];
  friends: Friend[];
  centerOn?: { lat: number; lng: number };
  onPositionUpdate: (position: { latitude: number; longitude: number }) => void;
}

const LocateControl = ({
  onLocationFound,
}: {
  onLocationFound: (latlng: L.LatLng) => void;
}) => {
  const map = useMapEvents({
    locationfound(e) {
      onLocationFound(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });
  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control leaflet-bar">
        <a
          href="#"
          title="Centra sulla mia posizione"
          onClick={(e) => {
            e.preventDefault();
            map.locate();
          }}
          className="flex items-center justify-center w-10 h-10 bg-white text-black"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 ml-1"
          >
            <path
              fillRule="evenodd"
              d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            />
          </svg>
        </a>
      </div>
    </div>
  );
};

// Componente per centrare la mappa
const CenterMap = ({ coords }: { coords: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 15);
  }, [map, coords]);
  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({
  filter,
  events,
  friends,
  centerOn,
  onPositionUpdate,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );

  const handleLocationFound = (latlng: L.LatLng) => {
    setUserLocation([latlng.lat, latlng.lng]);
    onPositionUpdate({ latitude: latlng.lat, longitude: latlng.lng });
  };

  return (
    <MapContainer
      center={userLocation || [44.498955, 11.327591]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      ref={mapRef}
    >
      <LocateControl onLocationFound={handleLocationFound} />
      {centerOn && <CenterMap coords={[centerOn.lat, centerOn.lng]} />}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {userLocation && (
        <Marker position={userLocation}>
          <Popup>You are here</Popup>
        </Marker>
      )}
      {(filter === "all" || filter === "events") &&
        events.map((event) => (
          <Marker key={event.id} position={[event.lat, event.lng]}>
            <Popup>
              <div>
                <h3 className="font-bold">{event.name}</h3>
                <p>{event.location}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      {(filter === "all" || filter === "friends") &&
        friends.map((friend) => (
          <Marker key={friend.id} position={[friend.lat, friend.lng]}>
            <Popup>{friend.name}</Popup>
          </Marker>
        ))}
    </MapContainer>
  );
};

export default MapComponent;
