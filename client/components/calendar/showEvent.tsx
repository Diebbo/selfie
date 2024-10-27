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
  Spinner
} from "@nextui-org/react";
import { parseDate } from "@internationalized/date";
import { Person, SelfieEvent, SelfieNotification } from "@/helpers/types";
import { useRouter } from 'next/navigation';

const EVENTS_API_URL = "/api/events";

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

async function fetchEvent(eventid: string) {
  try {
    const res = await fetch(`${EVENTS_API_URL}/${eventid}`, {
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
      throw new Error("Failed to fetch the event");
    }

    const data = await res.json();
    return data;
  } catch (e: unknown) {
    throw new Error(`Error during fetch event: ${(e as Error).message}`);
  }
}

interface ShowEventProps {
  eventid: string;
  user: Person;
}

const ShowEvent: React.FC<ShowEventProps> = ({ eventid, user }) => {
  const initialState: State = {
    isEditing: false,
    editedEvent: null,
    dateRange: null,
  };

  const [state, dispatch] = useReducer(eventReducer, initialState);
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<SelfieEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isOwner = user.events.created?.some(event => event._id === eventid) || false;

  useEffect(() => {
    let isMounted = true;

    const getEvent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const event = await fetchEvent(eventid);

        if (isMounted) {
          setSelectedEvent(event);
          // Initialize dateRange with the fetched event dates
          if (event?.dtstart && event?.dtend) {
            dispatch({
              type: 'UPDATE_DATE_RANGE',
              payload: {
                start: new Date(event.dtstart),
                end: new Date(event.dtend)
              }
            });
          }
        }
      } catch (err) {
        if (isMounted) {
          setError((err as Error).message);
          console.error('Error fetching event:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (eventid) {
      getEvent();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const handleEdit = () => {
    if (selectedEvent) {
      dispatch({ type: 'START_EDITING', payload: selectedEvent });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    router.refresh();
    router.push('/calendar');
  };

  const handleReset = () => {
    if (selectedEvent) {
      dispatch({ type: 'CANCEL_EDITING', payload: selectedEvent });
    }
  };

  const handleInputChange = (field: keyof SelfieEvent, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', payload: { field, value } });
  };

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

      dispatch({ type: 'RESET_STATE' });
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

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      scrollBehavior="outside"
    >
      <ModalContent>
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Spinner size="lg" />
          </div>
        ) : error ? (
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
                isReadOnly={!state.isEditing}
                value={displayEvent?.title as string}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="max-w-xs"
              />
              <div className="justify-end">
                <Button
                  className={`mx-2 ${state.isEditing ? "" : "hidden"}`}
                  onClick={handleReset}
                  color="secondary"
                >
                  Cancel
                </Button>
                <Button
                  className="mx-2 mr-4"
                  onClick={handleEdit}
                  isDisabled={state.isEditing}
                  color="primary"
                >
                  Edit
                </Button>
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
              <Input
                isReadOnly={!state.isEditing}
                label="Location"
                value={displayEvent.location as string}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="mb-4"
              />
              <Input
                isReadOnly={!state.isEditing}
                label="Description"
                value={displayEvent.description as string}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="mb-4"
              />
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
                  <Input
                    isReadOnly={!state.isEditing}
                    label="Notification Start Date"
                    value={displayEvent.notification.fromDate.toString().split('T')[0]}
                    onChange={(e) => handleNotificationChange('fromDate', new Date(e.target.value))}
                    type="date"
                    className="mb-4"
                  />
                </>
              )}
            </ModalBody>
            <ModalFooter>

              {isOwner && (
                <div>
                  <Button
                    color="danger"
                    variant="light"
                    onPress={deleteEvent}
                  >
                    Delete Event
                  </Button>
                  <Button
                    color="primary"
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
                    {"Close"}
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
