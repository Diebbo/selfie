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
} from "@nextui-org/react";
import { parseDate } from "@internationalized/date";
import { Person, SelfieEvent, SelfieNotification } from "@/helpers/types";
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
};

type Action =
  | { type: 'START_EDITING'; payload: SelfieEvent }
  | { type: 'CANCEL_EDITING'; payload: SelfieEvent }
  | { type: 'UPDATE_FIELD'; payload: { field: keyof SelfieEvent; value: any } }
  | { type: 'UPDATE_DATE_RANGE'; payload: { start: Date; end: Date } }
  | { type: 'UPDATE_NOTIFICATION'; payload: { field: keyof SelfieNotification; value: any } }
  | { type: 'UPDATE_GEO'; payload: Geo }
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

    case 'CANCEL_EDITING':
      return {
        isEditing: false,
        editedEvent: { ...action.payload },
        dateRange: {
          start: new Date(action.payload.dtstart),
          end: new Date(action.payload.dtend)
        }
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
        dateRange: null
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
}

const ShowEvent: React.FC<ShowEventProps> = ({ owner, event, user }) => {
  const initialState: State = {
    isEditing: false,
    editedEvent: null,
    dateRange: null,
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
  };

  const handleNotificationChange = (field: keyof SelfieNotification, value: any) => {
    dispatch({ type: 'UPDATE_NOTIFICATION', payload: { field, value } });
  };

  async function modifyEvent() {
    try {
      if (!state.editedEvent) return;

      const updatedEvent = {
        ...state.editedEvent,
        dtstart: state.dateRange?.start || state.editedEvent.dtstart,
        dtend: state.dateRange?.end || state.editedEvent.dtend,
      };

      console.log("evento modificato: ", updatedEvent);
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

  const displayEvent = state.isEditing ? state.editedEvent : selectedEvent;
  console.log(displayEvent);

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
              Chiudi
            </Button>
          </div>
        ) : displayEvent ? (
          <>
            <ModalHeader className="flex justify-between items-center">
              <Input
                isReadOnly={!state.isEditing}
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
                  Annulla
                </Button>
                {user._id === displayEvent.uid && !state.isEditing &&
                  <Button
                    className="mx-2 mr-4"
                    onClick={handleEdit}
                    color="primary"
                  >
                    Modifica
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
                  start: parseDate(displayEvent.dtstart.toString().split('T')[0]),
                  end: parseDate(displayEvent.dtend.toString().split('T')[0]),
                }}
                value={state.dateRange ? {
                  start: parseDate(state.dateRange.start.toISOString().split('T')[0]),
                  end: parseDate(state.dateRange.end.toISOString().split('T')[0])
                } : undefined}
                onChange={handleDateRangeChange as any}
                isDisabled={!state.isEditing}
                visibleMonths={2}
              />
              <div>
                <Autocomplete
                  label="Luogo"
                  placeholder={displayEvent?.location.toString()}
                  items={locationSuggestions}
                  isReadOnly={!state.isEditing}
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
              <Input
                isReadOnly={!state.isEditing}
                label="Description"
                value={displayEvent.description as string}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="mb-4"
              />

              {participants && participants.length > 0 &&
                <Input
                  isReadOnly={!state.isEditing}
                  label="Participants"
                  value={[owner, ...participants.map(p => p.toString())].join(", ")}

                  onChange={(e) => handleInputChange('URL', e.target.value)}
                  className="mb-4"
                />
              }
              <Input
                isReadOnly={!state.isEditing}
                label="URL"
                value={displayEvent.URL as string}
                onChange={(e) => handleInputChange('URL', e.target.value)}
                className="mb-4"
              />
              <Input
                isReadOnly={!state.isEditing}
                label="Categories"
                value={displayEvent.categories?.join(", ")}
                onChange={(e) => handleInputChange('categories', e.target.value.split(", "))}
                className="mb-4"
              />
              {displayEvent.notification && (
                <>
                  <Input
                    isReadOnly={!state.isEditing}
                    label="Notification Title"
                    value={displayEvent.notification.title as string}
                    onChange={(e) => handleNotificationChange('title', e.target.value)}
                    className="mb-4"
                  />
                  <DatePicker
                    isReadOnly={!state.isEditing}
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
