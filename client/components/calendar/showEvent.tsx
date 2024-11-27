"use client";
import React, { useReducer, useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  DateRangePicker,
  DatePicker,
  Autocomplete,
  AutocompleteItem,
  Select,
  SelectItem,
  DateValue,
  Switch,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from "@nextui-org/react";
import {
  CalendarDate,
  ZonedDateTime,
  getLocalTimeZone,
} from "@internationalized/date";
import { Person, ResourceModel, SelfieEvent, People } from "@/helpers/types";
import { useRouter } from 'next/navigation';
import { useReload } from "./contextStore";
import { useDebouncedCallback } from "use-debounce";

const EVENTS_API_URL = "/api/events";

interface Geo {
  lat: number;
  lon: number;
}

type State = {
  isEditing: boolean;
  editedEvent: SelfieEvent | null;
  dateRange: { start: Date; end: Date } | null;
  availableResources: ResourceModel[];
};

type Action =
  | { type: 'START_EDITING'; payload: SelfieEvent }
  | { type: 'CANCEL_EDITING'; payload: SelfieEvent }
  | { type: 'UPDATE_FIELD'; payload: { field: keyof SelfieEvent; value: any } }
  | { type: 'UPDATE_DATE_RANGE'; payload: { start: Date; end: Date } }
  | { type: 'UPDATE_NOTIFICATION'; payload: { field: string; value: any } }
  | { type: 'UPDATE_GEO'; payload: Geo }
  | { type: 'UPDATE_AVAILABLE_RESOURCES'; payload: ResourceModel[] }
  | { type: 'RESET_STATE' };

function eventReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START_EDITING':
      return {
        ...state,
        isEditing: true,
        editedEvent: { ...action.payload },
        dateRange: {
          start: new Date(action.payload.dtstart),
          end: new Date(action.payload.dtend)
        }
      };

    case 'UPDATE_AVAILABLE_RESOURCES':
      return {
        ...state,
        availableResources: action.payload
      };

    case 'CANCEL_EDITING':
      return {
        isEditing: false,
        editedEvent: { ...action.payload },
        dateRange: {
          start: new Date(action.payload.dtstart),
          end: new Date(action.payload.dtend)
        },
        availableResources: state.availableResources,
      };

    case 'UPDATE_FIELD':
      return {
        ...state,
        editedEvent: state.editedEvent ? {
          ...state.editedEvent,
          [action.payload.field]: action.payload.value
        } : null
      };

    case 'UPDATE_DATE_RANGE':
      return {
        ...state,
        dateRange: action.payload,
        editedEvent: state.editedEvent ? {
          ...state.editedEvent,
          dtstart: action.payload.start,
          dtend: action.payload.end
        } : null
      };

    case 'UPDATE_NOTIFICATION':
      return {
        ...state,
        editedEvent: state.editedEvent ? {
          ...state.editedEvent,
          notification: {
            ...state.editedEvent.notification,
            [action.payload.field]: action.payload.value
          }
        } : null
      };

    case 'UPDATE_GEO':
      console.log("update_geo action", action);
      return {
        ...state,
        editedEvent: state.editedEvent ? {
          ...state.editedEvent,
          geo: {
            lat: action.payload.lat,
            lon: action.payload.lon,
          }
        } : null
      }

    case 'RESET_STATE':
      return {
        isEditing: false,
        editedEvent: null,
        dateRange: null,
        availableResources: state.availableResources,
      };

    default:
      return state;
  }
}

async function fetchParticipants(eventid: string) {
  try {
    const res = await fetch(`${EVENTS_API_URL}/${eventid}/participants`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store"
    });

    if (res.status === 401) {
      throw new Error("Unauthorized, please login.");
    } else if (res.status >= 500) {
      throw new Error(`Server error: ${res.statusText}`);
    } else if (!res.ok) {
      throw new Error("Failed to fetch participants' usernames");
    }

    const data = await res.json();
    return data;
  } catch (error: unknown) {
    console.error("Error fetching participants' usernames:", error);
  }
}

export const getDateParsed = (date: Date | string, allDay: Boolean): DateValue => {
  if (allDay) {
    return convertToDate(date);
  }
  return convertToZonedDateTime(date);
};

const convertToDate = (date: Date | string): DateValue => {
  const dateObj = date instanceof Date ? date : new Date(date);

  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();

  return new CalendarDate(year, month, day);
};

const convertToZonedDateTime = (date: Date | string | ZonedDateTime): DateValue => {
  if (date instanceof ZonedDateTime) return date;
  const dateObj = date instanceof Date ? date : new Date(date);
  const OFFSET_TO_MILLISECONDS = 60 * 1000;

  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  const hour = dateObj.getHours();
  const min = dateObj.getMinutes();
  const offset = -dateObj.getTimezoneOffset() * OFFSET_TO_MILLISECONDS;
  const zone = getLocalTimeZone();

  return new ZonedDateTime(year, month, day, zone, offset, hour, min);
};


interface LocationSuggestion {
  label: string;
  value: string;
  lat: number;
  lon: number;
  id: string;
}

interface ShowEventProps {
  event: SelfieEvent;
  user: Person;
  owner: string;
  resource: ResourceModel[];
  friends: People;
}

const ShowEvent: React.FC<ShowEventProps> = ({ owner, event, user, resource, friends }) => {
  const [selectedEvent, setSelectedEvent] = useState<SelfieEvent | null>(event);

  const getAvailableFriends = (friends: People, participants: string[] | undefined) => {
    if (!participants) return friends;
    return friends.filter(friend => !participants.includes(friend._id));
  };

  const handleRemoveResource = () => {
    if (state.editedEvent) {
      handleInputChange('resource', '');
      setResourceValue('No resource booked');

      const updatedResources = getAvailableResources(
        resource,
        state.dateRange?.start || new Date(state.editedEvent.dtstart),
        state.dateRange?.end || new Date(state.editedEvent.dtend)
      );

      dispatch({
        type: 'UPDATE_AVAILABLE_RESOURCES',
        payload: updatedResources
      });
    }
  };

  const checkResourceAvailability = (resource: ResourceModel, start: Date, end: Date) => {
    if (!resource.used || resource.used.length <= 0) return true;

    return !resource.used.some(usage => {
      const usageStart = new Date(usage.startTime);
      const usageEnd = new Date(usage.endTime);

      // Check if the event's time period overlaps with any usage period
      return !(end <= usageStart || start >= usageEnd);
    });
  };

  const getAvailableResources = (resources: ResourceModel[], start: Date, end: Date) => {
    return resources.filter(r => {
      const myBookId = r?.used.find(r => (r.startTime === selectedEvent?.dtstart) && r.endTime === selectedEvent.dtend)?._id;
      if (r.used.map(r => r._id === myBookId)) return true;
      return checkResourceAvailability(r, start, end);
    });
  };

  const initialState: State = {
    isEditing: false,
    editedEvent: null,
    dateRange: null,
    availableResources: getAvailableResources(
      resource,
      new Date(event.dtstart),
      new Date(event.dtend)
    ),
  };

  const [isOpen, setIsOpen] = useState(true);
  const [state, dispatch] = useReducer(eventReducer, initialState);
  const [notifications, setNotifications] = useState(selectedEvent?.notification.fromDate !== undefined);
  const [errorTitle, setErrorTitle] = useState(false);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<People | null>(null);
  const [availableFriends, setAvailableFriends] = useState<People>(
    getAvailableFriends(friends, event.participants)
  );
  const eventid = event._id;
  const isOwner = user._id === event.uid ? true : false;
  const { reloadEvents, setReloadEvents } = useReload();
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);

  const updateAvailableResources = (start: Date, end: Date) => {
    const available = getAvailableResources(resource, start, end);
    dispatch({ type: 'UPDATE_AVAILABLE_RESOURCES', payload: available });
  };

  useEffect(() => {
    if (state.dateRange) {
      updateAvailableResources(state.dateRange.start, state.dateRange.end);
    }
  }, [state.dateRange]);

  const handleLocationSelect = (value: string) => {
    const selectedItem = locationSuggestions.find((item) => item.id === value);
    if (selectedItem) {
      handleInputChange('location', selectedItem.label);
      handleGeoChange({
        lat: selectedItem.lat,
        lon: selectedItem.lon
      });
    }
  };

  useEffect(() => {
    let isMounted = true;

    const getParticipants = async () => {
      try {
        const result = await fetchParticipants(eventid);
        if (result) {
          setParticipants(result.usernames);
        }
      } catch (e: unknown) {
        console.log("Error fetching participants", e)
      }
    }

    if (eventid) {
      getParticipants();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchLocationSuggestions = useDebouncedCallback(
    async (query: string) => {
      if (query.length > 3) {
        try {
          const response = await fetch(
            `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10`,
          );
          const data = await response.json();

          const uniqueItems = new Set();

          const suggestions = data.features
            .map((item: any) => {
              const lat = item.geometry.coordinates[1];
              const lon = item.geometry.coordinates[0];

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
                id: `${primaryName}|${lat}|${lon}`,
              };
            })
            .filter((item: LocationSuggestion) => {
              if (!uniqueItems.has(item.id)) {
                uniqueItems.add(item.id);
                return true;
              }
              return false;
            });

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

  const handleEdit = () => {
    if (selectedEvent) {
      dispatch({ type: 'START_EDITING', payload: selectedEvent });
    }
  };

  const handleClose = () => {
    setReloadEvents(true);
    router.push("/calendar");
  };

  const handleReset = () => {
    if (selectedEvent) {
      dispatch({ type: 'CANCEL_EDITING', payload: selectedEvent });

      setResourceValue(selectedEvent.resource || 'No resource booked');

      setNotifications(selectedEvent.notification.fromDate !== undefined);

      setErrorTitle(false);
      setError(null);

      setLocationSuggestions([]);

      const originalResources = getAvailableResources(
        resource,
        new Date(selectedEvent.dtstart),
        new Date(selectedEvent.dtend)
      );
      dispatch({
        type: 'UPDATE_AVAILABLE_RESOURCES',
        payload: originalResources
      });
    }
  };

  const handleInputChange = (field: keyof SelfieEvent, value: any) => {
    console.log("check input change", field, value);
    dispatch({ type: 'UPDATE_FIELD', payload: { field, value } });
  };

  const handleGeoChange = (coordinates: Geo) => {
    dispatch({ type: 'UPDATE_GEO', payload: coordinates });
  }

  const handleDateRangeChange = (range: { start: Date; end: Date }) => {
    dispatch({ type: 'UPDATE_DATE_RANGE', payload: range });
    updateAvailableResources(range.start, range.end);
  };

  const handleNotificationChange = (field: string, value: any) => {
    dispatch({ type: 'UPDATE_NOTIFICATION', payload: { field, value } });
  };

  const handleParticipantSelect = (friend: Person) => {
    if (!state.editedEvent) return;

    const updatedParticipants = [...(state.editedEvent.participants || []), friend._id];
    handleInputChange('participants', updatedParticipants);
    setAvailableFriends(getAvailableFriends(friends, updatedParticipants));
  };

  const handleRemoveParticipant = (friend: Person) => {
    if (!state.editedEvent) return;

    const updatedParticipants = state.editedEvent.participants?.filter(
      (id) => id !== friend._id
    ) || [];
    handleInputChange('participants', updatedParticipants);
    setAvailableFriends(getAvailableFriends(friends, updatedParticipants));
  };

  const handleRemoveAllParticipants = () => {
    if (!state.editedEvent) return;

    handleInputChange('participants', []);
    setAvailableFriends(friends);
  };

  async function handleResource(updatedEvent: any, selectedEvent: SelfieEvent | null) {
    // caso base: no action needed 
    if (updatedEvent.resource === '' && '' === selectedEvent?.resource) {
      console.log("nessuna modifica per le risorse, si esce");
      handleClose();
      return;
    }

    const oldR = resource.find(r => r.name === selectedEvent?.resource);
    console.log("oldR", oldR)
    const newR = resource.find(r => r.name === updatedEvent?.resource);
    console.log("newR", newR)

    const oldBookId = oldR?.used.find(r => (r.startTime === selectedEvent?.dtstart) && r.endTime === selectedEvent.dtend)?._id;
    console.log("oldBookId:", oldBookId, oldR?._id);

    // caso 1: unbook risorsa (x -> 0)
    var res;
    if (updatedEvent.resource === '') {
      res = await fetch(`${EVENTS_API_URL}/resource/${newR?._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookId: oldBookId }),
        cache: "no-store",
      });

    } else {
      // caso in cui è avvenuta una modifica all'evento che interessa anche la risorsa
      // (y -> x || 0 -> x)
      // (updatedEvent.resource !== selectedEvent?.resource
      // || updatedEvent.dtstart !== selectedEvent!.dtstart
      // || updatedEvent.dtend !== selectedEvent!.dtend) 

      const q = `${EVENTS_API_URL}/resource/${newR?._id}` + (oldBookId !== undefined ? `?oldBookId=${oldBookId}` : "");
      console.log("query", q);
      res = await fetch(q, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ startDate: updatedEvent.dtstart, endDate: updatedEvent.dtend }),
        cache: "no-store",
      });
    }

    if (!res.ok) {
      throw new Error(`Failed to modify event: ${res.statusText}`);
    }

  };

  async function modifyEvent() {
    try {
      if (!state.editedEvent) return;

      if (state.editedEvent.title === "") {
        setErrorTitle(true);
        return;
      }

      // Convert CalendarDate or ZonedDateTime to standard Date objects
      const convertToStandardDate = (date: DateValue | Date | string): Date => {
        if (date instanceof Date) return date;

        if (date instanceof CalendarDate) {
          // For CalendarDate, create a Date object
          return new Date(date.year, date.month - 1, date.day);
        }

        if (typeof date === 'string') {
          return new Date(date);
        }

        // For ZonedDateTime, convert to local Date
        return new Date(date.toDate(getLocalTimeZone()));
      };

      const updatedEvent = {
        ...state.editedEvent,
        dtstart: state.editedEvent.allDay ?
          convertToStandardDate(state.editedEvent.dtstart).setHours(0, 0) :
          convertToStandardDate(state.editedEvent.dtstart),
        dtend: state.editedEvent.allDay ?
          convertToStandardDate(state.editedEvent.dtend).setHours(23, 59) :
          convertToStandardDate(state.editedEvent.dtend),
        // If notification has dates, convert them too
        ...(state.editedEvent.notification?.fromDate && {
          notification: {
            ...state.editedEvent.notification,
            fromDate: convertToStandardDate(state.editedEvent.notification.fromDate)
          }
        })
      };

      var res = await fetch(`${EVENTS_API_URL}/${selectedEvent?._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ event: updatedEvent }),
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Failed to modify event: ${res.statusText}`);
      }

      handleResource(updatedEvent, selectedEvent);

      handleClose();
      return;
    } catch (e: unknown) {
      console.error(`Error during modify event: ${(e as Error).message}`);
      setError((e as Error).message);
    }
  }

  async function deleteEvent() {
    try {
      const res = await fetch(`${EVENTS_API_URL}/${selectedEvent?._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to delete event: ${res.statusText}`);
      }

      if (selectedEvent?.resource !== "") {
        const r = resource.find(r => r.name === selectedEvent?.resource);
        const bookId = r?.used.find(r => (r.startTime === selectedEvent?.dtstart) && r.endTime === selectedEvent.dtend)?._id;
        const res = await fetch(`${EVENTS_API_URL}/resource/${r?._id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bookId: bookId }),
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Failed to unBook the resource: ${res.statusText}`);
        }
      }

      dispatch({ type: 'RESET_STATE' });
      handleClose();
    } catch (e: unknown) {
      console.error(`Error during delete event: ${(e as Error).message}`);
      setError((e as Error).message);
    }
  }

  async function dodgeEvent() {
    try {
      const res = await fetch(`${EVENTS_API_URL}/${selectedEvent?._id}/?fields=true`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to delete event: ${res.statusText}`);
      }

      dispatch({ type: 'RESET_STATE' });
      handleClose();
    } catch (e: unknown) {
      console.error(`Error during delete event: ${(e as Error).message}`);
      setError((e as Error).message);
    }
  }

  const displayEvent = state.isEditing ? state.editedEvent : selectedEvent;
  console.log("resource display.resource selectedEvent.resource", resource, displayEvent?.resource, selectedEvent?.resource);
  console.log("forse", resource.find(m => m.name === displayEvent?.resource)?.name);

  const [resourceValue, setResourceValue] = useState<string>(
    displayEvent?.resource || 'No resource booked');
  console.log("resourceValue", resourceValue);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      scrollBehavior="outside"
    >
      <ModalContent>
        {error ? (
          <div className="p-8 text-center text-red-500">
            <p>Error: {error}</p>
            <Button color="primary" className="mt-4" onClick={handleClose}>
              Close
            </Button>
          </div>
        ) : displayEvent ? (
          <>
            <ModalHeader className="flex justify-between items-center">
              <Input
                isDisabled={!state.isEditing}
                value={displayEvent?.title as string}
                isInvalid={errorTitle}
                isRequired={true}
                errorMessage={"Title is mandatory"}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="max-w-xs"
              />
              <div className="justify-end">
                <Button
                  className={`mx-2 mr-4 ${state.isEditing ? "" : "hidden"}`}
                  onClick={handleReset}
                  color="secondary"
                >
                  Cancel
                </Button>
                {user._id === displayEvent.uid && !state.isEditing &&
                  <Button
                    className="mx-2 mr-4"
                    onClick={handleEdit}
                    color="primary"
                  >
                    Modify
                  </Button>
                }

              </div>
            </ModalHeader>
            <ModalBody>
              <DateRangePicker
                label="Event duration"
                className="max-w-[430px] mb-4"
                hideTimeZone
                defaultValue={{
                  start: getDateParsed(displayEvent.dtstart, displayEvent.allDay),
                  end: getDateParsed(displayEvent.dtend, displayEvent.allDay),
                }}
                value={state.dateRange ? {
                  start: getDateParsed(state.dateRange.start, displayEvent.allDay),
                  end: getDateParsed(state.dateRange.end, displayEvent.allDay)
                }
                  : undefined}

                onChange={handleDateRangeChange as any}
                isDisabled={!state.isEditing}
                visibleMonths={1}
              />
              <div>
                <Autocomplete
                  label="Location"
                  placeholder={displayEvent?.location.toString()}
                  items={locationSuggestions}
                  isDisabled={!state.isEditing}
                  onInputChange={(value) => {
                    handleInputChange("location", value);
                    fetchLocationSuggestions(value);
                  }}
                  onSelectionChange={(value) => handleLocationSelect(value as string)}
                  defaultFilter={(textValue, inputValue) => {
                    const lowerCaseInput = inputValue.toLowerCase().trim();
                    const searchWords = lowerCaseInput.split(/\s+/);
                    return searchWords.every((word) =>
                      textValue.toLowerCase().includes(word)
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
              <div className="mb-2">
                <div className="flex flex-row gap-2 items-center">
                  <Select
                    label="Resource"
                    className="mb-2"
                    isDisabled={!state.isEditing}
                    placeholder={resourceValue}
                    value={resourceValue}
                    selectedKeys={resourceValue !== 'No resource booked' ? [resourceValue] : []}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setResourceValue(newValue);
                      handleInputChange('resource', newValue);
                    }}
                  >
                    {state.availableResources.map((res) => (
                      <SelectItem key={res.name} value={res.name}>
                        {res.name}
                      </SelectItem>
                    ))}
                  </Select>
                  <Button
                    size="md"
                    className="mb-2"
                    color="danger"
                    variant="flat"
                    isDisabled={!state.isEditing}
                    onPress={handleRemoveResource}
                  >
                    Remove
                  </Button>
                </div>
                {state.isEditing && state.availableResources.length === 0 && (
                  <p className="text-warning text-sm">
                    There are not resources available for choosen period
                  </p>
                )}
              </div>
              <Input
                isDisabled={!state.isEditing}
                label="Description"
                value={displayEvent.description as string}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="mb-4"
              />

              <div aria-label="Participants" className="flex w-full gap-4 mb-4">
                <Autocomplete
                  variant="bordered"
                  label="Friends"
                  placeholder="Choose someone to invite"
                  labelPlacement="inside"
                  selectedKey=""
                  className="max-w-sm"
                  isDisabled={!state.isEditing || availableFriends.length === 0}
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
                      <Button variant="flat" className="min-w-[calc(10vw)]">
                        Invited ({displayEvent?.participants?.length || 0})
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Invited participants"
                      className="max-h-[300px] overflow-y-auto"
                    >
                      {displayEvent?.participants?.length ? (
                        displayEvent.participants
                          .map((participantId) => {
                            const participant = friends.find(friend => friend._id === participantId);
                            if (!participant) return null;

                            return (
                              <DropdownItem
                                key={participantId}
                                className="py-2"
                                endContent={
                                  state.isEditing ? (
                                    <Button
                                      size="sm"
                                      color="danger"
                                      variant="light"
                                      onPress={() => handleRemoveParticipant(participant)}
                                    >
                                      Remove
                                    </Button>
                                  ) : null
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
                          .filter((item): item is JSX.Element => item !== null)
                      ) : (
                        <DropdownItem className="text-default-400">
                          None invited yet
                        </DropdownItem>
                      )}
                    </DropdownMenu>
                  </Dropdown>
                  {state.isEditing && (
                    <Button
                      size="md"
                      color="danger"
                      variant="flat"
                      isDisabled={!displayEvent?.participants?.length}
                      onPress={handleRemoveAllParticipants}
                    >
                      Remove All
                    </Button>
                  )}
                </div>
              </div>

              <Input
                isDisabled={!state.isEditing}
                label="URL"
                value={displayEvent.URL as string}
                onChange={(e) => handleInputChange('URL', e.target.value)}
                className="mb-4"
              />
              <Input
                isDisabled={!state.isEditing}
                label="Categories"
                value={displayEvent.categories?.join(", ")}
                onChange={(e) => handleInputChange('categories', e.target.value.split(", "))}
                className="mb-4"
              />

              <Switch
                className="w-fit min-w-[120px] mb-2"
                isSelected={notifications}
                isDisabled={!state.isEditing}
                onValueChange={setNotifications}
              >
                Allow Notifications
              </Switch>

              {notifications && (
                <>
                  <Input
                    isDisabled={!state.isEditing}
                    label="Notification Title"
                    value={displayEvent.notification.title as string}
                    onChange={(e) => handleNotificationChange('title', e.target.value)}
                    className="mb-2"
                  />
                  <Input
                    isDisabled={!state.isEditing}
                    label="Notification Description"
                    value={displayEvent.notification.description as string}
                    onChange={(e) => handleNotificationChange('description', e.target.value)}
                    className="mb-2"
                  />
                  <Select
                    label="Notification type"
                    isDisabled={!state.isEditing}
                    placeholder={displayEvent.notification.type.toString()}
                    className="mb-2"
                    variant="bordered"
                    selectedKeys={
                      displayEvent.notification?.type?.toString() ? [displayEvent.notification.type.toString()] : []
                    }
                    onSelectionChange={(keys) =>
                      handleNotificationChange('type', Array.from(keys)[0])
                    }
                  >
                    <SelectItem key="email" value="email">
                      Email
                    </SelectItem>
                    <SelectItem key="push" value="push">
                      Push
                    </SelectItem>
                  </Select>

                  <DatePicker
                    defaultValue={getDateParsed(displayEvent.dtstart, displayEvent.allDay)}
                    maxValue={getDateParsed(displayEvent.dtstart, displayEvent.allDay)}
                    isRequired
                    hideTimeZone
                    isDisabled={!state.isEditing}
                    label="Notification Start Date"
                    onChange={(date) => handleNotificationChange('fromDate', date)}
                    className="mb-2"
                  />

                  <div className="flex flex-row gap-4">
                    <Select
                      label="Frequency repetition"
                      isDisabled={!state.isEditing}
                      variant="bordered"
                      classNames={{
                        base: "data-[hover=true]:bg-yellow-300",
                      }}
                      selectedKeys={
                        displayEvent?.notification.repetition?.freq?.toString()
                          ? [displayEvent?.notification.repetition.freq.toString()]
                          : []
                      }
                      onSelectionChange={(keys) =>
                        handleNotificationChange("repetition.freq", Array.from(keys)[0])
                      }
                    >
                      <SelectItem key="minutely" value="minutely">
                        Minutely
                      </SelectItem>
                      <SelectItem key="hourly" value="hourly">
                        Hourly
                      </SelectItem>
                      <SelectItem key="daily" value="daily">
                        Daily
                      </SelectItem>
                      <SelectItem key="weekly" value="weekly">
                        Weekly
                      </SelectItem>
                      <SelectItem key="monthly" value="monthly">
                        Monthly
                      </SelectItem>
                      <SelectItem key="yearly" value="yearly">
                        Yearly
                      </SelectItem>
                    </Select>

                    <Input
                      label="Interval repetition"
                      isDisabled={!state.isEditing}
                      type="number"
                      value={displayEvent.notification.repetition?.interval?.toString() || ""}
                      onChange={(e) => handleNotificationChange("repetition.interval", e.target.value)}
                      placeholder="Set the frequency repetition"
                    />

                  </div>
                </>
              )}
            </ModalBody>
            <ModalFooter className="justify-end">

              {isOwner && (
                <div>
                  <Button
                    color="danger"
                    variant="light"
                    className="border-1 border-danger mx-2"
                    onPress={deleteEvent}
                  >
                    Delete Event
                  </Button>
                  <Button
                    color={`${!state.isEditing ? "primary" : "success"}`}
                    className="mx-2"
                    onPress={state.isEditing ? modifyEvent : handleClose}
                  >
                    {state.isEditing ? "Save" : "Close"}
                  </Button>
                </div>
              )}

              {!isOwner && (
                <div>
                  <Button
                    color="danger"
                    variant="light"
                    onPress={dodgeEvent}
                  >
                    Dodge Event
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleClose}
                  >
                    Close
                  </Button>
                </div>
              )}

            </ModalFooter>
          </>
        ) : (
          <div className="p-8 text-center">
            <p>No event data found</p>
            <Button color="primary" className="mt-4" onClick={handleClose}>
              Close
            </Button>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ShowEvent;
