"use client";

import React, { useState, useEffect, ReactElement } from "react";
import { areIntervalsOverlapping, parseISO } from "date-fns";
import { Interval } from "date-fns";
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
  cn,
  Autocomplete,
  AutocompleteItem,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useDebouncedCallback } from "use-debounce";
import RepetitionMenu from "@/components/calendar/repetitionMenu";
import EventDatePicker from "@/components/calendar/eventDatePicker";
import {
  SelfieEvent,
  SelfieNotification,
  FrequencyType,
  People,
  Person,
  DayType,
  RRule,
  ResourceModel,
} from "@/helpers/types";
import NotificationMenu from "./notificationMenu";
const EVENTS_API_URL = "/api/events";
import { useReload } from "./contextStore";

async function createEvent(
  event: SelfieEvent,
  resourceId: string | undefined,
): Promise<boolean> {
  try {
    console.log("evento aggiunto", event);
    var res = await fetch(`${EVENTS_API_URL}`, {
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

    console.log("aggiungo la risorsa con Id: ", resourceId);
    if (resourceId !== undefined) {
      res = await fetch(`${EVENTS_API_URL}/resource/${resourceId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: event.dtstart,
          endDate: event.dtend,
        }),
        cache: "no-store",
      });
    }
  } catch (e) {
    throw new Error(`Error during adding event: ${(e as Error).message}`);
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
  allDay: false,
  categories: [""],
  location: "",
  description: "",
  URL: "",
  participants: [] as string[],
  isRrule: false,
  rrule: {
    freq: "weekly" as FrequencyType,
    interval: 1,
    count: 1,
    byday: [{ day: "MO" as DayType }],
  } as RRule,
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
  resource: "" as string,
};

interface EventAdderProps {
  friends: People;
  isMobile: Boolean;
  resource: ResourceModel[];
}

const EventAdder: React.FC<EventAdderProps> = ({
  friends,
  isMobile,
  resource,
}) => {
  console.log("eventAdder risorse", resource);
  const [isOpen, setIsOpen] = useState(false);
  const [availableResources, setAvailableResources] = useState<ResourceModel[]>(
    [],
  );
  const [selectedResource, setSelectedResource] = useState<
    ResourceModel | undefined
  >(undefined);
  const [eventData, setEventData] =
    useState<Partial<SelfieEvent>>(initialEvent);
  const [locationSuggestions, setLocationSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [repeatEvent, setRepeatEvent] = useState(false);
  const [allDayEvent, setAllDayEvent] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [isError, setIsError] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [notificationError, setNotificationError] = useState(false);
  const { reloadEvents, setReloadEvents } = useReload();
  const availableFriends = friends.filter(
    (friend) => !eventData.participants?.includes(friend._id),
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
      },
    }));
  }, [eventData.dtstart, eventData.dtend]);

  // Aggiorna le risorse disponibili quando cambiano le date dell'evento
  useEffect(() => {
    if (!resource || !Array.isArray(resource)) {
      setAvailableResources([]);
      return;
    }

    const available = resource.filter((r) =>
      checkResourceAvailability(
        r,
        eventData.dtstart as Date,
        eventData.dtend as Date,
      ),
    );
    console.log("available: ", available);
    setAvailableResources(available);
  }, [eventData.dtstart, eventData.dtend, resource]);

  // Risorsa è disponibile nel periodo selezionato
  const checkResourceAvailability = (
    resource: ResourceModel,
    startDate: Date,
    endDate: Date,
  ): boolean => {
    return !resource.used.some((usage) => {
      const usageStart = new Date(usage.startTime);
      const usageEnd = new Date(usage.endTime);
      return checkOverlap(startDate, endDate, usageStart, usageEnd);
    });
  };

  function checkOverlap(
    start1: string | Date,
    end1: string | Date,
    start2: string | Date,
    end2: string | Date,
  ): boolean {
    const interval1: Interval = {
      start: start1 instanceof Date ? start1 : parseISO(start1),
      end: end1 instanceof Date ? end1 : parseISO(end1),
    };
    const interval2: Interval = {
      start: start2 instanceof Date ? start2 : parseISO(start2),
      end: end2 instanceof Date ? end2 : parseISO(end2),
    };

    return areIntervalsOverlapping(interval1, interval2);
  }

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
      } else {
        setLocationSuggestions([]);
      }
    },
    300,
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
                [repetitionField]: value,
              },
            },
          };
        }

        // Se stiamo gestendo fromDate
        if (notificationField === "fromDate") {
          return {
            ...prev,
            notification: {
              ...prev.notification,
              fromDate: new Date(value),
            },
          };
        }

        // Per tutti gli altri campi della notification
        return {
          ...prev,
          notification: {
            ...prev.notification,
            [notificationField]: value,
          },
        };
      });
    } else {
      // Per tutti i campi non correlati alla notification
      setEventData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (start: Date | string, end: Date | string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    setEventData((prev) => {
      //keep resource if possible
      if (prev.resource) {
        const selectedResource = resource.find((r) => r.name === prev.resource);
        if (
          selectedResource &&
          !checkResourceAvailability(selectedResource, startDate, endDate)
        ) {
          //remove old resource
          return {
            ...prev,
            dtstart: startDate,
            dtend: endDate,
            resource: "",
          };
        }
      }

      return {
        ...prev,
        dtstart: startDate,
        dtend: endDate,
      };
    });
  };

  const handleRepeatChange = (value: boolean) => {
    setRepeatEvent(value);
    if (!value) {
      setEventData((prev) => ({ ...prev, rrule: undefined }));
    } else {
      setEventData((prev) => ({
        ...prev,
        rrule: {
          freq: "weekly",
          interval: 1,
          count: 1,
          byday: [{ day: "MO" as DayType }],
        },
      }));
    }
  };

  const handleRruleChange = (newRrule: RRule) => {
    setEventData((prev) => ({
      ...prev,
      rrule: newRrule,
    }));
    console.log("newRrule", newRrule);
  };

  const handleParticipantSelect = (friend: Person) => {
    setEventData((prev) => ({
      ...prev,
      participants: [...(prev.participants || []), friend._id],
    }));
    console.log(eventData.participants);
  };

  const handleRemoveParticipant = (friendToRemove: Person) => {
    setEventData((prev) => ({
      ...prev,
      participants: (prev.participants || []).filter(
        (participantId) => participantId !== friendToRemove._id,
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
  };

  const handleSave = () => {
    if (eventData.title === "") {
      setIsError(true);
    } else {
      setIsError(false);
    }
  };

  const validateRrule = (rrule: RRule | undefined): boolean => {
    if (!rrule) return true;

    // Basic validation
    if (!rrule.freq || rrule.interval < 1) return false;

    // Validate count or until if present
    if (rrule.count && rrule.count < 1) return false;
    if (rrule.until && new Date(rrule.until) < new Date()) return false;

    // Validate weekly frequency
    if (rrule.freq === "weekly" && (!rrule.byday || rrule.byday.length === 0)) {
      return false;
    }

    // Validate monthly frequency
    if (rrule.freq === "monthly") {
      // Must have either bymonthday or byday with position, not both
      if (rrule.bymonthday && rrule.byday) return false;
      if (!rrule.bymonthday && (!rrule.byday || !rrule.byday[0].position))
        return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (repeatEvent && !validateRrule(eventData.rrule)) {
      console.error("Invalid recurrence rule");
      return;
    }

    console.log("isError", isError, "dateError", dateError);
    if (!isError && !notificationError && !dateError) {
      const newEvent: SelfieEvent = {
        ...eventData,
        sequence: 0,
        isRrule: repeatEvent,
        rrule: repeatEvent ? eventData.rrule : undefined,
        categories: eventData.categories || [],
        participants: eventData.participants || [],
        allDay: allDayEvent,
      } as SelfieEvent;

      try {
        console.log("aggiungo la risorsa _id", selectedResource?._id);
        const success = await createEvent(newEvent, selectedResource?._id);
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
        className="fixed bottom-6 right-6 min-w-[56px] h-14 rounded-full shadow-lg z-50 p-0 bg-primary hover:bg-primary/90"
        isIconOnly
        onPress={handleOpen}
        aria-label="Add Event"
      >
        <span className="text-2xl font-bold text-white">+</span>
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
              Creation of a New Event
            </ModalHeader>
            <ModalBody>
              <Input
                isRequired
                label="Title"
                isInvalid={isError}
                errorMessage="You need to insert the title before submit the event"
                name="title"
                value={eventData.title as string}
                onChange={handleInputChange}
                placeholder="Insert new title"
                className={`${isMobile ? "" : "mb-4"}`}
              />

              {isMobile && (
                <Switch
                  isSelected={allDayEvent}
                  onValueChange={setAllDayEvent}
                  className="mb-1"
                  classNames={{
                    base: cn(
                      "inline-flex flex-row-reverse w-full max-w-lg bg-[#f4f4f5] dark:bg-[#27272a]  hover:bg-content2 items-center",
                      "justify-between rounded-lg gap-2 p-2 border-2 border-transparent",
                    ),
                    wrapper: "p-0 h-4 overflow-visible",
                    thumb: cn(
                      "w-5 h-5 border-2 shadow-lg",
                      "group-data-[hover=true]:border-secondary",
                      //selected
                      "group-data-[selected=true]:ml-6",
                      // pressed
                      "group-data-[pressed=true]:w-7",
                      "group-data-[selected]:group-data-[pressed]:ml-4",
                    ),
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-medium">Tutto il giorno</p>
                  </div>
                </Switch>
              )}

              <div className={`${isMobile ? "max-w-fit" : "flex gap-4 mb-4 "}`}>
                <EventDatePicker
                  isAllDay={allDayEvent}
                  onChange={handleDateChange}
                  setDateError={setDateError}
                />

                {!isMobile && (
                  <Switch
                    isSelected={allDayEvent}
                    onValueChange={() => {
                      setAllDayEvent(!allDayEvent);
                    }}
                  >
                    All Day Long
                  </Switch>
                )}
              </div>
              <div className="flex flex-wrap gap-4 ">
                <div className="flex items-center gap-4 w-full md:w-auto max-h-[50px]">
                  <Switch
                    className="min-w-[120px]"
                    isSelected={repeatEvent}
                    onValueChange={handleRepeatChange}
                  >
                    <span className="pl-2">Repeat</span>
                  </Switch>
                  <RepetitionMenu
                    value={repeatEvent}
                    rrule={eventData.rrule}
                    isMobile={isMobile}
                    onChange={handleRruleChange}
                  />
                </div>
              </div>
              <div>
                <Autocomplete
                  label="Event Location"
                  placeholder="Search where the event will take place"
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
              </div>

              <div>
                <Select
                  label="Resources Avaiable"
                  placeholder="Select a resource"
                  selectedKeys={
                    eventData.resource
                      ? new Set([eventData.resource.toString()])
                      : new Set()
                  }
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0]?.toString() || "";
                    setSelectedResource(
                      availableResources.find(
                        (res) => res.name === selectedKey,
                      ),
                    );
                    setEventData((prev) => ({
                      ...prev,
                      resource: selectedKey,
                    }));
                  }}
                  className={`${isMobile ? "" : "mb-4"}`}
                >
                  {availableResources.map((res) => (
                    <SelectItem
                      key={res.name.toString()}
                      value={res.name.toString()}
                    >
                      {res.name.toString()}
                    </SelectItem>
                  ))}
                </Select>
                {availableResources.length === 0 && (
                  <p className="text-warning text-sm mt-1">
                    There are not resources available for choosen period
                  </p>
                )}
              </div>

              <Textarea
                label="Description"
                name="description"
                value={eventData.description?.toString()}
                onChange={handleInputChange}
                placeholder="Insert a description"
                className={`${isMobile ? "" : "mb-4"}`}
              />
              <div
                className={`flex w-full gap-4 ${isMobile ? "flex-wrap items-start items-center" : "mb-4"}`}
              >
                <Autocomplete
                  variant="bordered"
                  label="Friends"
                  placeholder="Choose someone to invite"
                  labelPlacement="inside"
                  selectedKey=""
                  className="max-w-sm"
                  isDisabled={availableFriends.length === 0}
                  onSelectionChange={(key) => {
                    const selectedFriend = friends.find(
                      (friend) => friend.email === key,
                    );
                    if (selectedFriend) handleParticipantSelect(selectedFriend);
                  }}
                >
                  {availableFriends.map((friend) => (
                    <AutocompleteItem
                      key={friend.email}
                      textValue={friend.username}
                    >
                      <div className="flex gap-2 items-center">
                        <Avatar
                          alt={friend.username}
                          className="flex-shrink-0"
                          size="sm"
                          src={friend.avatar}
                        />
                        <div className="flex flex-col">
                          <span className="text-small">{friend.username}</span>
                          <span className="text-tiny text-default-400">
                            {friend.email}
                          </span>
                        </div>
                      </div>
                    </AutocompleteItem>
                  ))}
                </Autocomplete>
                <div className="flex gap-2 w-full">
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        variant="flat"
                        className={`${isMobile ? "min-w-[200px] w-[calc(65vw)]" : "min-w-[calc(10vw)]"}`}
                      >
                        Invited ({eventData.participants?.length || 0})
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Invited participants"
                      className="max-h-[300px] overflow-y-auto"
                    >
                      {eventData.participants?.length ? (
                        eventData.participants
                          .map((participantId) => {
                            const participant = friends.find(
                              (friend) => friend._id === participantId,
                            );
                            if (!participant) return null;

                            return (
                              <DropdownItem
                                key={participantId}
                                className="py-2"
                                endContent={
                                  <Button
                                    size="sm"
                                    color="danger"
                                    variant="light"
                                    onPress={() =>
                                      handleRemoveParticipant(participant)
                                    }
                                  >
                                    Remove
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
                                    <span className="text-small">
                                      {participant.username}
                                    </span>
                                    <span className="text-tiny text-default-400">
                                      {participant.email}
                                    </span>
                                  </div>
                                </div>
                              </DropdownItem>
                            );
                          })
                          .filter((item) => !!item)
                      ) : (
                        <DropdownItem className="text-default-400" key="none">
                          None invited yet
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
                    Remove All
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
                placeholder="Choose categories (separete them with commas)"
                className="mb-4"
              />
              <Input
                label="URL"
                name="URL"
                value={eventData.URL?.toString()}
                onChange={handleInputChange}
                placeholder="Insert URL for your event"
                className="mb-4"
              />
              <div className="flex flex-col pb-4 gap-4 ">
                <Switch
                  className="w-fit min-w-[120px]"
                  isSelected={notifications}
                  onValueChange={setNotifications}
                >
                  Allow Notifications
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
                Save
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EventAdder;
