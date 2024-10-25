"use client";
import React, { useRef, useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
  CircleMarker,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css"; // Re-uses images from ~leaflet package
import * as L from "leaflet";
import "leaflet-defaulticon-compatibility";

import { MapEvent, MapFriend } from "@/actions/maps";
import GpsIcon from "../icons/GpsIcon";
import FriendsIcon from "../icons/FriendsIcon";
import { useRouter } from "next/navigation";
import CalendarIcon from "../icons/CalendarIcon";
import EventIcon from "../icons/EventIcon";

interface MapComponentProps {
  filter: "all" | "events" | "friends";
  events: MapEvent[];
  friends: MapFriend[];
  centerOn: { lat: number; lng: number };
  // props to update user GPS to db
  onPositionUpdate: (position: { latitude: number; longitude: number }) => void;
}

// Button to center the map on the user's location
const LocateControl = ({
  onLocationFound,
}: {
  onLocationFound: (latlng: L.LatLng) => void;
}) => {
  const map = useMapEvents({
    locationfound(e) {
      onLocationFound(e.latlng); // update the user's location in the db
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
          className="inline-flex items-center justify-center w-10 h-10 bg-white text-black"
        >
          <div className="flex items-center justify-center w-full h-full">
            <GpsIcon />
          </div>
        </a>
      </div>
    </div>
  );
};

// Center the map on coords send as prop when clicking on an event in the list
const CenterMap = ({ coords }: { coords: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.closePopup();
    map.setView(coords, map.getZoom());
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
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<[number, number]>([
    centerOn.lat,
    centerOn.lng,
  ]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    centerOn.lat,
    centerOn.lng,
  ]);

  useEffect(() => {
    setMapCenter([centerOn.lat, centerOn.lng]);
  }, [centerOn]);

  const handleLocationFound = (latlng: L.LatLng) => {
    console.log("handleLocationFound");
    setUserLocation([latlng.lat, latlng.lng]);
    setMapCenter([latlng.lat, latlng.lng]);
    onPositionUpdate({ latitude: latlng.lat, longitude: latlng.lng });
  };

  return (
    <MapContainer
      center={userLocation}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <CenterMap coords={mapCenter} />
      <LocateControl onLocationFound={handleLocationFound} />

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {userLocation && (
        <Marker position={userLocation}>
          <Popup className="custom-popup">
            <div className="flex flex-col items-center p-2 min-w-[200px]">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-2">
                <GpsIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-bold text-lg text-green-900 dark:text-green-100">
                La tua posizione
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                <div className="flex flex-col items-center">
                  <span>Lat: {userLocation[0].toFixed(6)}</span>
                  <span>Lng: {userLocation[1].toFixed(6)}</span>
                </div>
              </div>
              <button
                className="mt-3 px-4 py-1.5 bg-green-500 hover:bg-green-600
                         text-white rounded-full text-sm font-medium
                         transition-colors duration-200
                         shadow-sm hover:shadow-md
                         active:scale-95"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${userLocation[0].toFixed(6)}, ${userLocation[1].toFixed(6)}`,
                  );
                }}
              >
                Copia Coordinate
              </button>
            </div>
          </Popup>
        </Marker>
      )}
      {(filter === "all" || filter === "events") &&
        events.map((event) => (
          <Marker key={event.id} position={[event.lat, event.lng]}>
            <Popup className="custom-popup">
              <div className="flex flex-col p-2 min-w-[250px]">
                {/* Header con icona e titolo */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <EventIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-bold text-lg text-purple-900 dark:text-purple-100">
                    {event.name}
                  </h3>
                </div>

                {/* Info evento */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <CalendarIcon className="w-4 h-4" />
                    <div>
                      <div>
                        Inizio:{" "}
                        {event.dtstart.toLocaleString("it-IT", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                      <div>
                        Fine:{" "}
                        {event.dtend.toLocaleString("it-IT", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                    </div>
                  </div>

                  {event.location && (
                    <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                      <GpsIcon className="w-4 h-4 mt-1 flex-shrink-0" />
                      <span>{event.location}</span>
                    </div>
                  )}

                  {event.description && (
                    <div className="border-t border-gray-200 dark:border-gray-700 ">
                      <p className="text-gray-600 dark:text-gray-300">
                        {event.description}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  className="mt-3 px-4 py-1.5 bg-purple-500 hover:bg-purple-600
                           text-white rounded-full text-sm font-medium
                           transition-colors duration-200
                           shadow-sm hover:shadow-md
                           active:scale-95 w-full"
                  onClick={() => {
                    router.push(`/calendar/${event.id}`);
                  }}
                >
                  Vedi Dettagli
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      {(filter === "all" || filter === "friends") &&
        friends.map((friend) => (
          <Marker key={friend.id} position={[friend.lat, friend.lng]}>
            <Popup className="custom-popup">
              <div className="flex flex-col items-center p-2 min-w-[200px]">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-2">
                  {/* TODO: Show Friends Avatar Icon */}
                  <FriendsIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100">
                  {friend.name}
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Ultimo aggiornamento: {/* ADD last GPS update in db */}
                </div>
                <button
                  className="mt-3 px-4 py-1.5 bg-blue-600 hover:bg-blue-800
                           text-white rounded-full text-sm font-medium
                           transition-colors duration-200
                           shadow-sm hover:shadow-md
                           active:scale-95"
                  onClick={() => {
                    router.push(`/chats/${friend.name}`);
                  }}
                >
                  Contatta
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
};

export default MapComponent;
