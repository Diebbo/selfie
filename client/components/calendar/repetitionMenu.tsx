"use client";

import React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  Checkbox,
  Input,
  RadioGroup,
  Radio,
} from "@nextui-org/react";
import { FrequencyType, DayType, PositionType, RRule } from "@/helpers/types";

const frequencyOptions = {
  daily: "Day",
  weekly: "Week",
  monthly: "Month",
  yearly: "Year",
} as const;

const weekDays = {
  MO: "M",
  TU: "T",
  WE: "W",
  TH: "T",
  FR: "F",
  SA: "S",
  SU: "S",
} as const;

interface RepetitionMenuProps {
  value: boolean;
  rrule: RRule | undefined;
  isMobile: Boolean;
  onChange: (rrule: RRule) => void;
}

const RepetitionMenu: React.FC<RepetitionMenuProps> = ({
  value,
  rrule,
  isMobile,
  onChange,
}) => {
  const getFrequencyLabel = (): string => {
    if (!value || !rrule) return "No repeat";
    const interval = rrule.interval > 1 ? `${rrule.interval} ` : "";
    const freqLabel = frequencyOptions[rrule.freq as keyof typeof frequencyOptions]?.toLowerCase() || "";
    return `Every ${interval}${freqLabel}${rrule.interval > 1 ? 's' : ''}`;
  };

  const handleFrequencyChange = (freq: FrequencyType) => {
    const newRrule: RRule = {
      freq,
      interval: 1,
      count: 1,
    };
    if (freq === "weekly") newRrule.byday = [{ day: "MO" }];
    onChange(newRrule);
  };

  return (
    <Popover placement="bottom">
      <PopoverTrigger>
        <Button
          className={`${isMobile ? "w-full" : "w-auto"} min-w-[150px]`}
          variant="bordered"
          isDisabled={!value}
        >
          {getFrequencyLabel()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px]">
        <div className="p-4">
          <div className="mb-4">
            <p className="text-sm font-semibold mb-2">Frequency</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(frequencyOptions) as Array<keyof typeof frequencyOptions>).map((key) => (
                <Button
                  key={key}
                  size="sm"
                  variant={rrule?.freq === key ? "solid" : "bordered"}
                  onPress={() => handleFrequencyChange(key as FrequencyType)}
                >
                  {frequencyOptions[key]}
                </Button>
              ))}
            </div>
          </div>

          {value && rrule && (
            <>
              <div className="mb-4">
                <p className="text-sm font-semibold mb-2">Interval</p>
                <Input
                  type="number"
                  label="Repeat every"
                  min={1}
                  value={rrule.interval.toString()}
                  onChange={(e) => onChange({ ...rrule, interval: parseInt(e.target.value) || 1 })}
                  className="w-full"
                />
              </div>

              {rrule.freq === "weekly" && (
                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2">Days</p>
                  <div className="flex justify-between">
                    {(Object.entries(weekDays) as Array<[DayType, string]>).map(([day, label]) => (
                      <Checkbox
                        key={day}
                        isSelected={rrule.byday?.some(d => d.day === day)}
                        onValueChange={(checked) => {
                          const newByday = checked
                            ? [...(rrule.byday || []), { day }]
                            : (rrule.byday || []).filter(d => d.day !== day);
                          onChange({ ...rrule, byday: newByday });
                        }}
                        size="sm"
                      >
                        {label}
                      </Checkbox>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold mb-2">End</p>
                <RadioGroup
                  value={rrule.count ? "count" : rrule.until ? "until" : "never"}
                  onValueChange={(type) => {
                    if (type === "count") {
                      onChange({ ...rrule, count: 1, until: undefined });
                    } else if (type === "until") {
                      onChange({ ...rrule, until: new Date(), count: undefined });
                    } else {
                      onChange({ ...rrule, until: undefined, count: undefined });
                    }
                  }}
                  size="sm"
                >
                  <Radio value="never">Never</Radio>
                  <Radio value="count">After occurrences</Radio>
                  <Radio value="until">On date</Radio>
                </RadioGroup>

                {rrule.count && (
                  <Input
                    type="number"
                    min={1}
                    value={rrule.count.toString()}
                    onChange={(e) => onChange({ ...rrule, count: parseInt(e.target.value) || 1 })}
                    className="mt-2"
                    size="sm"
                  />
                )}

                {rrule.until && (
                  <Input
                    type="date"
                    value={rrule.until.toISOString().split('T')[0]}
                    onChange={(e) => onChange({ ...rrule, until: new Date(e.target.value) })}
                    className="mt-2"
                    size="sm"
                  />
                )}
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default RepetitionMenu;
