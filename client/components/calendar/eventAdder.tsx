"use client";

import React, { useState, useContext, useEffect } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Switch,
  Autocomplete,
  AutocompleteItem,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { useDebouncedCallback } from "use-debounce";
import RepetitionMenu from "@/components/calendar/repetitionMenu";
import EventDatePicker from "@/components/calendar/eventDatePicker";
import {
  SelfieEvent,
  SelfieNotification,
  FrequencyType,
  People,
} from "@/helpers/types";
import NotificationMenu from "./notificationMenu";
const EVENTS_API_URL = "/api/events";
import { reloadContext } from "./reloadContext";

async function createEvent(event: SelfieEvent): Promise<boolean> {
  try {
    const res = await fetch(`${EVENTS_API_URL}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ event: event }),
      cache: "no-store",
    });

    if (res.status === 401) {
      throw new Error("Unauthorized, please login.");
    } else if (res.status >= 500) {
      throw new Error(`Server error: ${res.statusText}`);
    } else if (!res.ok) {
      throw new Error("Failed to create events");
    }
  } catch (e) {
    throw new Error(`Error during modify event: ${(e as Error).message}`);
  }
  return true;
}

interface LocationSuggestion {
  label: string;
  value: string;
  lat: number;
  lon: number;
  id: string;
}

const initialEvent = {
  title: "",
  summary: "",
  status: "confirmed",
  transp: "OPAQUE",
  dtstart: new Date(),
  dtend: new Date(),
  dtstamp: new Date().toISOString(),
  categories: [""],
  location: "",
  description: "",
  URL: "",
  participants: [] as People,
  rrule: {
    freq: "weekly" as FrequencyType,
    interval: 1,
    bymonth: 1,
    bymonthday: 1,
  },
  notification: {
    title: "",
    description: "",
    type: "",
    repetition: {
      freq: "",
      interval: 0,
    },
    fromDate: new Date(),
  },
};

interface EventAdderProps {
  friends: People;
}

const EventAdder: React.FC<EventAdderProps> = ({
  friends,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [eventData, setEventData] = useState<Partial<SelfieEvent>>(initialEvent);
export default function EventAdder() {
  const [isOpen, setIsOpen] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [eventData, setEventData] = useState<Partial<SelfieEvent>>({
    title: "",
    summary: "",
    status: "confirmed",
    transp: "OPAQUE",
    dtstart: new Date(),
    dtend: new Date(),
    dtstamp: new Date().toISOString(),
    categories: [""],
    location: "",
    description: "",
    URL: "",
    participants: [] as Person[],
    rrule: {
      freq: "weekly",
      interval: 1,
      bymonth: 1,
      bymonthday: 1,
    },
    notification: {
      title: "",
      description: "",
      type: "",
      repetition: {
        freq: "",
        interval: 1,
      },
      fromDate: new Date(),
    },
  });
  const [repeatEvent, setRepeatEvent] = useState(false);
  const [allDayEvent, setAllDayEvent] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [isError, setIsError] = useState(false);
  const [notificationError, setNotificationError] = useState(false);
  const { reloadEvents, setReloadEvents } = useContext(reloadContext) as any;

  const availableFriends = friends.filter(friend =>
    !eventData.participants?.some(participant => participant.email === friend.email)
  );

  useEffect(() => {
    setEventData((prev: any) => ({
      ...prev,
      notification: {
        ...prev.notification,
        title: prev.notification?.title || "",
        description: prev.notification?.description || "",
        type: "",
        fromDate: new Date(),
        repetition: {
          freq: "",
          interval: 0,
        },
      }
    }));
    console.log(eventData.notification);
  }, [eventData.dtstart, eventData.dtend]);

  const fetchLocationSuggestions = useDebouncedCallback(
    async (query: string) => {
      if (query.length > 3) {
        try {
          const response = await fetch(
            `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10`,
          );
          const data = await response.json();

          // Usa un Set per tenere traccia degli elementi unici
          const uniqueItems = new Set();

          const suggestions = data.features
            .map((item: any) => {
              const lat = item.geometry.coordinates[1];
              const lon = item.geometry.coordinates[0];

              // Usa street se c'è housenumber, altrimenti usa name
              const primaryName = item.properties.housenumber
                ? item.properties.street
                : item.properties.name;

              return {
                label: [
                  primaryName,
                  item.properties.housenumber,
                  item.properties.city,
                  item.properties.county,
                  item.properties.state,
                ]
                  .filter(Boolean)
                  .join(", "),
                value: primaryName,
                lat,
                lon,
                id: `${primaryName}|${lat}|${lon}`, // Crea un ID unico
              };
            })
            .filter((item: LocationSuggestion) => {
              if (!uniqueItems.has(item.id)) {
                uniqueItems.add(item.id);
                return true;
              }
              return false;
            });

          console.log("suggestions: ", suggestions);
          setLocationSuggestions(suggestions);
        } catch (error) {
          console.error("Error fetching location suggestions:", error);
        }
      }
    },
    1000,
  );

  const handleLocationSelect = (value: string) => {
    const selectedItem = locationSuggestions.find((item) => item.id === value);
    if (selectedItem) {
      setEventData((prev) => ({
        ...prev,
        location: selectedItem.label,
        geo: {
          lat: selectedItem.lat,
          lon: selectedItem.lon,
        },
      }));
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: any } },
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("title")) {
      setIsError(false);
    }

    if (name.startsWith("notification")) {
      const [_, notificationField, repetitionField] = name.split(".");

      setEventData((prev: any) => {
        // Se stiamo gestendo un campo di repetition
        if (notificationField === "repetition") {
          return {
            ...prev,
            notification: {
              ...prev.notification,
              repetition: {
                ...prev.notification.repetition,
                [repetitionField]: value
              }
            }
          };
        }

        // Se stiamo gestendo fromDate
        if (notificationField === "fromDate") {
          return {
            ...prev,
            notification: {
              ...prev.notification,
              fromDate: new Date(value).toISOString()
            }
          };
        }

        // Per tutti gli altri campi della notification
        return {
          ...prev,
          notification: {
            ...prev.notification,
            [notificationField]: value
          }
        };
      });
    } else {
      // Per tutti i campi non correlati alla notification
      setEventData(prev => ({ ...prev, [name]: value }));
    }
  };


  const handleDateChange = (start: Date | string, end: Date | string) => {
    setEventData((prev) => ({
      ...prev,
      dtstart: new Date(start),
      dtend: new Date(end),
    }));
  };

  const handleRepeatChange = (value: boolean) => {
    setRepeatEvent(value);
    if (!value) {
      setEventData((prev) => ({ ...prev, rrule: undefined }));
    } else {
      setEventData((prev) => ({
        ...prev,
        rrule: {
          freq: "weekly" as FrequencyType,
          interval: 1,
          bymonth: 1,
          bymonthday: 1,
        },
      }));
    }
  };

  const handleRruleChange = (frequency: FrequencyType) => {
    setEventData((prev) => ({
      ...prev,
      rrule: {
        ...prev.rrule,
        freq: frequency,
        interval: prev.rrule?.interval ?? 1,
        bymonth: prev.rrule?.bymonth ?? 1,
        bymonthday: prev.rrule?.bymonthday ?? 1,
      },
    }));
  };

  const handleParticipantSelect = (friend: any) => {
    setEventData((prev) => ({
      ...prev,
      participants: [...(prev.participants || []), friend],
    }));
  };

  const handleRemoveParticipant = (friendToRemove: any) => {
    setEventData((prev) => ({
      ...prev,
      participants: (prev.participants || []).filter(
        (friend) => friend.email !== friendToRemove.email
      ),
    }));
  };

  const handleRemoveAllParticipants = () => {
    setEventData((prev) => ({
      ...prev,
      participants: [],
    }));
  };

  const handleExit = () => {
    setIsOpen(false);
    setIsError(false);
    setNotificationError(false);
    setEventData(initialEvent);
  }

  const handleSave = () => {
    if (eventData.title === "") {
      setIsError(true);
    } else {
      setIsError(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(isError, notificationError);
    if (!isError && !notificationError) {
      const newEvent: SelfieEvent = {
        ...eventData,
        sequence: 0,
        categories: eventData.categories || [],
        participants: eventData.participants || [],
      } as SelfieEvent;

      try {
        const success = await createEvent(newEvent);
        if (success) {
          console.log("Event created successfully");
          handleExit();
        } else {
          console.error("Failed to create event");
        }
      } catch (error) {
        console.error("Error submitting event", error);
      }

      setReloadEvents(true);
    }
  };

  return (
    <>
      <Button
        variant="bordered"
        className="rounded-xl bg-primary text-base text-white border-transparent border-2 hover:border-white"
        onPress={handleOpen}
      >
        Nuovo Evento
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={handleExit}
        size="2xl"
        scrollBehavior="outside"
      >
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader className="flex flex-col gap-1">
              Creazione Evento
            </ModalHeader>
            <ModalBody>
              <Input
                isRequired
                label="Titolo"
                isInvalid={isError}
                errorMessage="You need to insert the title before submit the event"
                name="title"
                value={eventData.title as string}
                onChange={handleInputChange}
                placeholder="Inserisci il titolo"
                className="mb-4"
              />
              <div className="flex gap-4 mb-4">
                <EventDatePicker
                  isAllDay={allDayEvent}
                  startDate={eventData.dtstart as Date}
                  endDate={eventData.dtend as Date}
                  onChange={handleDateChange}
                />
                <Switch isSelected={allDayEvent} onValueChange={setAllDayEvent}>
                  Tutto il giorno
                </Switch>
              </div>
              <div className="flex pb-4 gap-4 ">
                <Switch
                  className="w-fit min-w-[120px]"
                  isSelected={repeatEvent}
                  onValueChange={handleRepeatChange}
                >
                  Si ripete
                </Switch>
                <RepetitionMenu
                  value={repeatEvent}
                  frequency={eventData.rrule?.freq}
                  onChange={handleRruleChange}
                />
                <Input
                  className={`${eventData.rrule?.freq ? "w-fit" : "hidden"}`}
                  label="Intervallo fra eventi"
                  value={eventData.rrule?.interval.toString()}
                />
                <Input
                  className={`${eventData.rrule?.freq === "monthly" ? "w-fit" : "hidden"}`}
                  label="Per giorno del mese"
                  value={eventData.rrule?.bymonthday.toString()}
                />
                <Input
                  className={`${eventData.rrule?.freq === "yearly" ? "w-fit" : "hidden"}`}
                  label="Per mese"
                  value={eventData.rrule?.bymonth.toString()}
                />
              </div>
              <Autocomplete
                label="Luogo"
                placeholder="Inserisci il luogo"
                defaultItems={locationSuggestions}
                onInputChange={(value) => {
                  handleInputChange({ target: { name: "location", value } });
                  fetchLocationSuggestions(value);
                }}
                onSelectionChange={(value) =>
                  handleLocationSelect(value as string)
                }
                defaultFilter={(textValue, inputValue) => {
                  const lowerCaseInput = inputValue.toLowerCase().trim();
                  const searchWords = lowerCaseInput.split(/\s+/);
                  return searchWords.every((word) =>
                    textValue.toLowerCase().includes(word),
                  );
                }}
              >
                {(item: LocationSuggestion) => (
                  <AutocompleteItem key={item.id} textValue={item.label}>
                    {item.label}
                  </AutocompleteItem>
                )}
              </Autocomplete>
              <Textarea
                label="Descrizione"
                name="description"
                value={eventData.description?.toString()}
                onChange={handleInputChange}
                placeholder="Inserisci una descrizione"
                className="mb-4"
              />
              <div className="flex gap-4 items-start mb-4 items-center">
                <Autocomplete
                  variant="bordered"
                  label="Amici"
                  placeholder="Seleziona un utente da invitare"
                  labelPlacement="inside"
                  className="max-w-sm"
                  isDisabled={availableFriends.length === 0}
                  onSelectionChange={(key) => {
                    const selectedFriend = friends.find(friend => friend.email === key);
                    if (selectedFriend) handleParticipantSelect(selectedFriend);
                  }}
                >
                  {availableFriends.map((friend) => (
                    <AutocompleteItem key={friend.email} textValue={friend.username}>
                      <div className="flex gap-2 items-center">
                        <Avatar alt={friend.username} className="flex-shrink-0" size="sm" src={friend.avatar} />
                        <div className="flex flex-col">
                          <span className="text-small">{friend.username}</span>
                          <span className="text-tiny text-default-400">{friend.email}</span>
                        </div>
                      </div>
                    </AutocompleteItem>
                  ))}
                </Autocomplete>

                <div className="flex gap-2">
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        variant="flat"
                        className={`{min-w-[200px]}`}
                      >
                        Invitati ({eventData.participants?.length || 0})
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Invited participants"
                      className="max-h-[300px] overflow-y-auto"
                    >
                      {eventData.participants?.length ? (
                        eventData.participants.map((participant) => (
                          <DropdownItem
                            key={participant.email}
                            className="py-2"
                            endContent={
                              <Button
                                size="sm"
                                color="danger"
                                variant="light"
                                onPress={() => handleRemoveParticipant(participant)}
                              >
                                Rimuovi
                              </Button>
                            }
                          >
                            <div className="flex gap-2 items-center">
                              <Avatar
                                alt={participant.username}
                                className="flex-shrink-0"
                                size="sm"
                                src={participant.avatar}
                              />
                              <div className="flex flex-col">
                                <span className="text-small">{participant.username}</span>
                                <span className="text-tiny text-default-400">{participant.email}</span>
                              </div>
                            </div>
                          </DropdownItem>
                        ))
                      ) : (
                        <DropdownItem className="text-default-400">
                          Nessun invitato
                        </DropdownItem>
                      )}
                    </DropdownMenu>
                  </Dropdown>

                  <Button
                    size="md"
                    color="danger"
                    variant="flat"
                    isDisabled={!eventData.participants?.length}
                    onPress={handleRemoveAllParticipants}
                  >
                    Rimuovi tutti
                  </Button>
                </div>
              </div>
              <Input
                label="Categorie"
                name="categories"
                value={eventData.categories?.join(", ")}
                onChange={(e) =>
                  setEventData((prev) => ({
                    ...prev,
                    categories: e.target.value.split(",").map((c) => c.trim()),
                  }))
                }
                placeholder="Inserisci le categorie (separate da virgola)"
                className="mb-4"
              />
              <Input
                label="URL"
                name="URL"
                value={eventData.URL?.toString()}
                onChange={handleInputChange}
                placeholder="Inserisci l'URL dell'evento"
                className="mb-4"
              />
              <div className="flex flex-col pb-4 gap-4 ">
                <Switch
                  className="w-fit min-w-[120px]"
                  isSelected={notifications}
                  onValueChange={setNotifications}
                >
                  Abilita le notifiche
                </Switch>
                <NotificationMenu
                  value={notifications}
                  notification={eventData.notification as SelfieNotification}
                  onChange={handleInputChange}
                  startEventDate={eventData.dtstart as Date}
                  notificationError={notificationError}
                  setNotificationError={setNotificationError}
                  isAllDay={allDayEvent}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" type="submit" onClick={handleSave}>
                Salva
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}

export default EventAdder;
