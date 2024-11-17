import React from "react";
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
  if (!value) return null;

  const handleNotificationChange = (name: string, value: any) => {
    if (name.startsWith("fromDate")) {
      if (new Date(value).getTime() > startEventDate.getTime())
        setNotificationError(true);
      else
        setNotificationError(false);
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
        label="Tipo notifica"
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
        onChange={(date) => handleNotificationChange("fromDate", date)}
        isInvalid={notificationError}
        granularity={isAllDay ? "day" : "minute"}
        errorMessage="You need to insert a date before the event starts"
      />
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
          Minuto
        </SelectItem>
        <SelectItem key="Hour" value="hourly">
          Oraria
        </SelectItem>
        <SelectItem key="Day" value="daily">
          Giornaliera
        </SelectItem>
        <SelectItem key="Week" value="weekly">
          Settimanale
        </SelectItem>
        <SelectItem key="Month" value="monthly">
          Mensile
        </SelectItem>
        <SelectItem key="Year" value="yearly">
          Annuale
        </SelectItem>
      </Select>
      <Input
        label="Interval repetition"
        value={notification?.repetition?.interval?.toString() || ""}
        onChange={(e) => handleNotificationChange("repetition.interval", e.target.value)}
        placeholder="Set the frequency repetition"
      />
    </div>
  );
};

export default NotificationMenu;
