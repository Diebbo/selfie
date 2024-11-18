import React, { useEffect } from "react";
import { Input, Select, SelectItem } from "@nextui-org/react";
import { DatePicker } from "@nextui-org/react";
import { SelfieNotification } from "@/helpers/types";
import { now, getLocalTimeZone } from "@internationalized/date";

interface NotificationMenuProps {
  value: boolean;
  notification: SelfieNotification;
  onChange: (event: { target: { name: string; value: any } }) => void;
  startEventDate: Date;
  isAllDay: boolean;
  notificationError: boolean;
  setNotificationError: React.Dispatch<React.SetStateAction<boolean>>;
}

const NotificationMenu: React.FC<NotificationMenuProps> = ({
  value,
  notification,
  onChange,
  startEventDate,
  isAllDay,
  notificationError,
  setNotificationError,
}) => {

  useEffect(() => {
    console.log("nofitication check");
    setNotificationError(checkValidDate(value));
  }, [startEventDate]);

  if (!value) return null;

  function checkValidDate(value: any) {
    return new Date(value).getTime() > startEventDate.getTime();
  }

  const handleNotificationChange = (name: string, value: any) => {
    if (name.startsWith("fromDate")) {
      setNotificationError(checkValidDate(value));
    }
    if (!notificationError) {
      onChange({
        target: {
          name: `notification.${name}`,
          value,
        },
      });
    }
  };


  return (
    <div className="flex flex-col gap-4 mt-3">
      <Input
        label="Notification title"
        value={notification?.title?.toString() || ""}
        onChange={(e) => handleNotificationChange("title", e.target.value)}
        placeholder="Insert notification title"
      />
      <Input
        label="Notification description"
        value={notification?.description?.toString() || ""}
        onChange={(e) =>
          handleNotificationChange("description", e.target.value)
        }
        placeholder="Insert notification description"
      />
      <Select
        label="Notification type"
        variant="bordered"
        selectedKeys={
          notification?.type?.toString() ? [notification.type.toString()] : []
        }
        onSelectionChange={(keys) =>
          handleNotificationChange("type", Array.from(keys)[0])
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
        defaultValue={now(getLocalTimeZone())}
        label="Starting notification date"
        isRequired
        hideTimeZone
        onChange={(date) => handleNotificationChange("fromDate", date.toDate())}
        isInvalid={notificationError}
        granularity={isAllDay ? "day" : "minute"}
        errorMessage="You need to insert a date before the starts of the event"
      />

      <div className="flex flex-row gap-4">
        <Select
          label="Frequency repetition"
          variant="bordered"
          classNames={{
            base: "data-[hover=true]:bg-yellow-300",
          }}
          selectedKeys={
            notification?.repetition?.freq?.toString()
              ? [notification.repetition.freq.toString()]
              : []
          }
          onSelectionChange={(keys) =>
            handleNotificationChange("repetition.freq", Array.from(keys)[0])
          }
        >
          <SelectItem key="Minute" value="minutely">
            Minutely
          </SelectItem>
          <SelectItem key="Hour" value="hourly">
            Hourly
          </SelectItem>
          <SelectItem key="Day" value="daily">
            Daily
          </SelectItem>
          <SelectItem key="Week" value="weekly">
            Weekly
          </SelectItem>
          <SelectItem key="Month" value="monthly">
            Monthly
          </SelectItem>
          <SelectItem key="Year" value="yearly">
            Yearly
          </SelectItem>
        </Select>
        <Input
          label="Interval repetition"
          type="number"
          value={notification?.repetition?.interval?.toString() || ""}
          onChange={(e) => handleNotificationChange("repetition.interval", e.target.value)}
          placeholder="Set the frequency repetition"
        />
      </div>

    </div>
  );
};

export default NotificationMenu;
