"use client";
import React from "react";
import {
  now,
  getLocalTimeZone,
  parseZonedDateTime,
  parseDateTime,
  parseDate,
  CalendarDateTime,
  parseAbsoluteToLocal,
  ZonedDateTime,
} from "@internationalized/date";
import { DatePicker, DateValue } from "@nextui-org/react";
import { Button } from "@nextui-org/react";

interface TimeModifierClientProps {
  onSubmit: (
    formData: FormData
  ) => Promise<{ success: boolean; error?: string }>;
  onReset: () => Promise<{ success: boolean; error?: string }>;
  onClose?: () => void;
  initialTime: Date;
}

const TimeModifierClient: React.FC<TimeModifierClientProps> = ({
  onSubmit,
  onReset,
  onClose,
  initialTime,
}) => {
  const [time, setTime] = React.useState(
    parseAbsoluteToLocal(initialTime.toISOString())
  );
  const [state, setState] = React.useState({ success: false, error: null });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent the default form submission behavior

    const formData = new FormData(event.currentTarget);
    formData.set("time", time.toDate().toISOString());

    const response = await onSubmit(formData);

    setState(response as any);
  };

  const handleReset = async () => {
    const response = await onReset();
    setState(response as any);

    if (response.success) {
      setTimeout(() => {
        onClose?.();
      }, 1000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-4 py-2">
      <div className="flex justify-items-center flex-col gap-4 items-center">
        <DatePicker
          label="Travel to ..."
          variant="bordered"
          hideTimeZone
          showMonthAndYearPickers
          value={time}
          onChange={(date: ZonedDateTime | null) : void => {
            if (date) {
              setTime(date);
            }
          }}
          className="max-w-60"
        />

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
