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
} from "@nextui-org/react";
import {
  CalendarDate,
  ZonedDateTime,
  getLocalTimeZone,
} from "@internationalized/date";
import { Person, ResourceModel, SelfieEvent, SelfieNotification } from "@/helpers/types";
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
  | { type: 'UPDATE_NOTIFICATION'; payload: { field: keyof SelfieNotification; value: any } }
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
}

const ShowEvent: React.FC<ShowEventProps> = ({ owner, event, user, resource }) => {
  const initialState: State = {
    isEditing: false,
    editedEvent: null,
    dateRange: null,
    availableResources: resource,
  };

  const [state, dispatch] = useReducer(eventReducer, initialState);
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<SelfieEvent | null>(event);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Person[] | null>(null);
  const eventid = event._id;
  const isOwner = user._id === event.uid ? true : false;
  const { reloadEvents, setReloadEvents } = useReload();
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);

  const checkResourceAvailability = (resource: ResourceModel, start: Date, end: Date) => {
    if (!resource.used || resource.used.length <= 0) return true;

    return !resource.used.some(usage => {
      const usageStart = new Date(usage.startTime);
      const usageEnd = new Date(usage.endTime);

      // Check if the event's time period overlaps with any usage period
      return !(end <= usageStart || start >= usageEnd);
    });
  };

  const updateAvailableResources = (start: Date, end: Date) => {
    const available = resource.filter(r => {
      // If this is the currently selected resource in edit mode, include it
      if (state.editedEvent && r._id === state.editedEvent.resource) return true;
      return checkResourceAvailability(r, start, end);
    });

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

  const handleEdit = () => {
    if (selectedEvent) {
      dispatch({ type: 'START_EDITING', payload: selectedEvent });
    }
  };

  const handleClose = () => {
    setReloadEvents(true);
    router.back();
  };

  const handleReset = () => {
    if (selectedEvent) {
      dispatch({ type: 'CANCEL_EDITING', payload: selectedEvent });
    }
  };

  const handleInputChange = (field: keyof SelfieEvent, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', payload: { field, value } });
  };

  const handleGeoChange = (coordinates: Geo) => {
    dispatch({ type: 'UPDATE_GEO', payload: coordinates });
  }

  const handleDateRangeChange = (range: { start: Date; end: Date }) => {
    dispatch({ type: 'UPDATE_DATE_RANGE', payload: range });
    updateAvailableResources(range.start, range.end);
  };

  const handleNotificationChange = (field: keyof SelfieNotification, value: any) => {
    dispatch({ type: 'UPDATE_NOTIFICATION', payload: { field, value } });
  };

  async function modifyEvent() {
    try {
      if (!state.editedEvent) return;

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

      console.log("Modified event with standard Date objects: ", updatedEvent);
      const res = await fetch(`${EVENTS_API_URL}/${selectedEvent?._id}`, {
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

      handleClose();
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

  const getDateParsed = (date: Date | string): DateValue => {
    if (displayEvent?.allDay) {
      return convertToDate(date);
    }
    console.log("prima");
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

    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const hour = dateObj.getHours();
    const min = dateObj.getMinutes();
    const offset = 3600000;
    const zone = getLocalTimeZone();

    return new ZonedDateTime(year, month, day, zone, offset, hour, min);
  };

  const displayEvent = state.isEditing ? state.editedEvent : selectedEvent;
  console.log(displayEvent?.resource);

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
                  start: getDateParsed(displayEvent.dtstart),
                  end: getDateParsed(displayEvent.dtend),
                }}
                value={state.dateRange ? {
                  start: getDateParsed(state.dateRange.start),
                  end: getDateParsed(state.dateRange.end)
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
              <Select
                label="Resource"
                className="mb-4"
                isDisabled={!state.isEditing}
                placeholder={displayEvent?.resource ? displayEvent.resource : ""}
                onChange={(e) => handleInputChange('resource', e.target.value)}
              >
                {state.availableResources.map((res) => (
                  <SelectItem key={res._id} value={res._id}>
                    {res.name}
                  </SelectItem>
                ))}
              </Select>
              <Input
                isDisabled={!state.isEditing}
                label="Description"
                value={displayEvent.description as string}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="mb-4"
              />

              {/* aggiungere il componente dei partecipanti qui */}

              <Input
                isDisabled={!state.isEditing}
                label="Participants"
                value={participants && participants?.length > 0 ? [owner, ...participants!.map(p => p.toString())].join(", ") : owner}

                onChange={(e) => handleInputChange('participants', e.target.value)}
                className="mb-4"
              />


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
              {displayEvent.notification && (
                <>
                  <Input
                    isDisabled={!state.isEditing}
                    label="Notification Title"
                    value={displayEvent.notification.title as string}
                    onChange={(e) => handleNotificationChange('title', e.target.value)}
                    className="mb-4"
                  />
                  <DatePicker
                    isDisabled={!state.isEditing}
                    label="Notification Start Date"
                    onChange={(date) => handleNotificationChange('fromDate', date)}
                    className="mb-4"
                  />
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
                    Cancella Evento
                  </Button>
                  <Button
                    color={`${!state.isEditing ? "primary" : "success"}`}
                    className="mx-2"
                    onPress={state.isEditing ? modifyEvent : handleClose}
                  >
                    {state.isEditing ? "Salva" : "Chiudi"}
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
                    Non Partecipare
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleClose}
                  >
                    Chiudi
                  </Button>
                </div>
              )}

            </ModalFooter>
          </>
        ) : (
          <div className="p-8 text-center">
            <p>No event data found</p>
            <Button color="primary" className="mt-4" onClick={handleClose}>
              Chiudi
            </Button>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ShowEvent;
