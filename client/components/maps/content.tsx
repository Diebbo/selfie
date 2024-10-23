"use client";
import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Radio,
  RadioGroup,
} from "@nextui-org/react";
import { MapEvent } from "@/actions/maps";
import { useGeolocation } from "@/helpers/useGeolocation";

const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => <p>Caricamento mappa...</p>,
});

export type Friend = {
  id: number;
  name: string;
  lat: number;
  lng: number;
};

const dummyFriends: Friend[] = [
  { id: 1, name: "Marco", lat: 45.465, lng: 9.191 },
  { id: 2, name: "Giulia", lat: 45.4655, lng: 9.192 },
];

interface ContentProps {
  events: MapEvent[];
}

const MapPage: React.FC<ContentProps> = ({ events }) => {
  const [filter, setFilter] = useState<"all" | "events" | "friends">("all");
  const [centerOn, setCenterOn] = useState<
    { lat: number; lng: number } | undefined
  >(undefined);

  const sendPositionToServer = useCallback(
    async (position: { latitude: number; longitude: number }) => {
      try {
        console.log("Sending position to server:", position);
        const response = await fetch("/api/users/gps", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(position),
        });

        if (!response.ok) {
          throw new Error("Failed to update position");
        }

        console.log("Position updated successfully");
      } catch (error) {
        console.error("Error updating position:", error);
      }
    },
    [],
  );

  const handlePositionUpdate = useCallback(
    (position: { latitude: number; longitude: number }) => {
      console.log("handlePositionUpdate");
      setCenterOn({ lat: position.latitude, lng: position.longitude });
      sendPositionToServer(position);
    },
    [sendPositionToServer],
  );

  const handleEventClick = (event: MapEvent) => {
    console.log("handleEeventClick");
    setCenterOn({ lat: event.lat, lng: event.lng });
  };

  return (
    <div className="flex h-screen p-4 bg-gray-100">
      <Card className="w-1/3 mr-4">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Lista</h2>
          <RadioGroup
            orientation="horizontal"
            value={filter}
            onValueChange={setFilter as any}
          >
            <Radio value="all">Tutti</Radio>
            <Radio value="events">Eventi</Radio>
            <Radio value="friends">Amici</Radio>
          </RadioGroup>
        </CardHeader>
        <Divider />
        <CardBody>
          {filter !== "friends" && (
            <>
              <h3 className="font-semibold mb-2">Eventi</h3>
              <ul>
                {events.map((event) => (
                  <li
                    key={event.id}
                    className="mb-2 cursor-pointer hover:text-blue-600"
                    onClick={() => handleEventClick(event)}
                  >
                    {event.name}
                  </li>
                ))}
              </ul>
            </>
          )}
          {filter !== "events" && (
            <>
              <h3 className="font-semibold mb-2 mt-4">Amici</h3>
              <ul>
                {dummyFriends.map((friend) => (
                  <li key={friend.id} className="mb-2">
                    {friend.name}
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardBody>
      </Card>
      <Card className="flex-grow">
        <CardBody>
          <MapComponent
            filter={filter}
            events={events}
            friends={dummyFriends}
            centerOn={centerOn}
            onPositionUpdate={handlePositionUpdate}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default MapPage;
