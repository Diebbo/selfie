"use client";
import React from "react";
import {
  now,
  getLocalTimeZone,
  parseZonedDateTime,
  parseDateTime,
  parseDate,
  CalendarDateTime,
} from "@internationalized/date";
import { DatePicker } from "@nextui-org/react";
import { Card, CardBody, Button, Input } from "@nextui-org/react";

interface TimeModifierClientProps {
  onSubmit: (
    formData: FormData,
  ) => Promise<{ success: boolean; error?: string }>;
  onReset: () => Promise<{ success: boolean; error?: string }>;

  onClose?: () => void; // Aggiungiamo questa prop per gestire la chiusura del modal
  initialTime: Date;
}

const TimeModifierClient: React.FC<TimeModifierClientProps> = ({
  onSubmit,
  onReset,

  onClose,
  initialTime,
}) => {
  const [time, setTime] = React.useState(initialTime.toISOString());
  const [state, setState] = React.useState({ success: false, error: null });
  const [currentTime, setCurrentTime] = React.useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent the default form submission behavior

    const formData = new FormData(event.currentTarget); // Create FormData from form

    // Invoke onSubmit with the form data
    const response = await onSubmit(formData);

    // Update the state based on the response
    setState(response as any);
  };

  const handleReset = async () => {
    const response = await onReset();
    setState(response as any);

    if (response.success) {
      // Chiudi il modal dopo un breve delay per mostrare il messaggio di successo
      setTimeout(() => {
        onClose?.();
      }, 1000);
    }
  };

  // Convert Date to type DateValue for
  const convertToCalendarDateTime = (date: Date) => {
    return new CalendarDateTime(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
    );
  };

  return (
    <form onSubmit={handleSubmit} className="px-4 py-2">
      <div className="flex justify-items-center flex-col gap-4 items-center">
        <DatePicker
          label="Travel to ..."
          variant="bordered"
          hideTimeZone
          showMonthAndYearPickers
          // Usa initialTime come valore di default
          defaultValue={convertToCalendarDateTime(initialTime)}
          onChange={(date) =>
            setTime(date.toDate(getLocalTimeZone()).toISOString())
          }
          className="max-w-60"
        />
        <input type="hidden" name="time" value={time} />

        <div className="flex gap-2 justify-center">
          <Button color="primary" variant="shadow" type="submit">
            Change Time
          </Button>
          <Button color="danger" variant="shadow" onClick={handleReset}>
            Reset Time
          </Button>
        </div>

        <div className="min-h-[20px]">
          {state.success && (
            <p className="text-green-500 text-center text-sm">
              Time changed successfully!
            </p>
          )}
          {state.error && (
            <p className="text-red-500 text-center text-sm">{state.error}</p>
          )}
        </div>
      </div>
    </form>
  );
};

export default TimeModifierClient;
