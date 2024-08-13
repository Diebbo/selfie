'use client';
import React from 'react';
import { now, getLocalTimeZone } from "@internationalized/date";
import { DatePicker, Button } from "@nextui-org/react";

interface TimeModifierClientProps {
  onSubmit: (formData: FormData) => Promise<{ success: boolean, error?: string }>;
}

const TimeModifierClient: React.FC<TimeModifierClientProps> = ({ onSubmit }) => {
  const [time, setTime] = React.useState(now(getLocalTimeZone()).toDate().toISOString());
  const [state, setState] = React.useState({ success: false, error: null });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent the default form submission behavior

    const formData = new FormData(event.currentTarget); // Create FormData from form

    // Invoke onSubmit with the form data
    const response = await onSubmit(formData);

    // Update the state based on the response
    setState(response as any);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className='flex justify-items-center flex-col gap-5'>
        <h2 className='text-center bold'>Time Machine</h2>
        <DatePicker
          label="Travel to ..."
          variant="bordered"
          hideTimeZone
          showMonthAndYearPickers
          defaultValue={now(getLocalTimeZone())}
          onChange={(date) => setTime(date.toDate().toISOString())}
        />
        <input type="hidden" name="time" value={time} />
        <Button color="primary" variant="shadow" type="submit">
          Change Current Time
        </Button>
        {state.success && <p className='text-green-500'>Time changed successfully!</p>}
        {state.error && <p className='text-red-500'>{state.error}</p>}
      </div>
    </form>
  );
};

export default TimeModifierClient;
