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
import { MapEvent, MapFriend } from "@/actions/maps";
import EventIcon from "../icons/EventIcon";
import CalendarIcon from "../icons/CalendarIcon";
import FriendsIcon from "../icons/FriendsIcon";
import { updateGPS } from "@/actions/user";

const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => <p></p>,
});

interface ContentProps {
  events: MapEvent[];
  friends: MapFriend[];
}

const MapPage: React.FC<ContentProps> = ({ events, friends }) => {
  const [filter, setFilter] = useState<"all" | "events" | "friends">("all");
  // To center the map on a specific location (GPS or event position)
  const [centerOn, setCenterOn] = useState<
    { lat: number; lng: number } | undefined
  >(undefined);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          console.log("updating gps");
          const { latitude, longitude } = coords;
          setCenterOn({ lat: latitude, lng: longitude });
          updateGPS({ latitude, longitude });
        },
        (error) => {
          fetchUserPosition();
        },
      );
    } else {
      fetchUserPosition();
    }
  }, []);

  // Get user position from db when loading the page to center the map

  const fetchUserPosition = async () => {
    try {
      console.log("fetching user position");
      const response = await fetch("/api/users/gps", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user position");
      }

      const data = await response.json();
      setCenterOn({ lat: data.latitude, lng: data.longitude });
    } catch (error) {
      console.error("Error fetching user position:", error);
    }
  };

  // Center map on event position when clicked on the event in the list
  const handleItemClick = (item: MapEvent | MapFriend) => {
    setCenterOn({ lat: item.lat, lng: item.lng });
  };

  return (
    <div className="flex flex-col lg:flex-row p-1 lg:p-3 bg-gray-100 dark:bg-sky-950 gap-1 lg:gap-3 h-full">
      {" "}
      <Card className="h-[30vh] lg:h-auto lg:w-1/3 border-2 border-blue-900">
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
        <CardBody className="overflow-auto px-4">
          {filter !== "friends" && (
            <div className="mb-6">
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-3">
                <CalendarIcon />
                Eventi
              </h3>
              {events.length === 0 ? (
                <p className="text-gray-500 text-sm italic px-2">
                  No events with location
                </p>
              ) : (
                <ul className="space-y-1">
                  {events.map((event) => (
                    <li
                      key={event.id}
                      onClick={() => handleItemClick(event)}
                      className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-200 ease-in-out hover:scale-[1.01] active:scale-[0.99] active:bg-gray-300 dark:active:bg-gray-900"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{event.name}</p>
                        {event.location && (
                          <p className="text-sm text-gray-500 truncate">
                            {event.location}
                          </p>
                        )}
                      </div>
                      <EventIcon />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {filter !== "events" && (
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-3">
                <FriendsIcon />
                Amici
              </h3>
              {friends.length === 0 ? (
                <p className="text-gray-500 text-sm italic px-2">
                  No friend shared location
                </p>
              ) : (
                <ul className="space-y-2">
                  {friends.map((friend) => (
                    <li
                      key={friend.id}
                      className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-200 ease-in-out hover:scale-[1.01] active:scale-[0.99] active:bg-gray-300 dark:active:bg-gray-900"
                      onClick={() => handleItemClick(friend)}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{friend.name}</p>
                      </div>
                      <EventIcon />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </CardBody>
      </Card>
      <Card className="relative flex-grow h-[60vh] lg:h-auto z-10 border-2 border-blue-900 ">
        <CardBody>
          <MapComponent
            filter={filter}
            events={events}
            friends={friends}
            centerOn={centerOn || { lat: 44.498955, lng: 11.327591 }}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default MapPage;
