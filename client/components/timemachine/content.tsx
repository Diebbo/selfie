'use client';
import React from 'react';
import { now, getLocalTimeZone } from "@internationalized/date";
import { DatePicker, Button } from "@nextui-org/react";
import { useFormState } from 'react-dom';

interface TimeModifierClientProps {
  onSubmit: (formData: FormData) => Promise<{ success: boolean, error?: string }>;
}

const TimeModifierClient: React.FC<TimeModifierClientProps> = ({ onSubmit }) => {
  const [time, setTime] = React.useState(now(getLocalTimeZone()));
  const [state, formAction] = useFormState(onSubmit, { success: false, error: null });

  return (
    <form action={formAction}>
      <div className='flex justify-items-center flex-col gap-5'>
        <h2 className='text-center bold'>Time Machine</h2>
        <DatePicker
          label="Event Date"
          variant="bordered"
          hideTimeZone
          showMonthAndYearPickers
          defaultValue={time}
          onChange={(date) => setTime(date)}
        />
        <input type="hidden" name="time" value={time.toDate().toISOString()} />
        <Button color="primary" variant="shadow" type="submit">
          Change Current Time
        </Button>
        {state.success && <p className='text-green-500'>Time changed successfully!</p>}
      </div>
    </form>
  );
}

export default TimeModifierClient;
