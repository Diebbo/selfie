import React from "react";
import { Input, Select, SelectItem } from "@nextui-org/react";
import { DatePicker } from "@nextui-org/react";
import { SelfieNotification } from "@/helpers/types";

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
    <div className="flex flex-col gap-4">
      <Input
        label="Titolo notifica"
        value={notification?.title?.toString() || ""}
        onChange={(e) => handleNotificationChange("title", e.target.value)}
        placeholder="Inserisci il titolo della notifica"
      />
      <Input
        label="Descrizione notifica"
        value={notification?.description?.toString() || ""}
        onChange={(e) =>
          handleNotificationChange("description", e.target.value)
        }
        placeholder="Inserisci la descrizione della notifica"
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
        //mettere la startEventDate come campo di default, se cambia cambio
        label="Data di inizio notifiche"
        isRequired
        onChange={(date) => handleNotificationChange("fromDate", date)}
        isInvalid={notificationError}
        granularity={isAllDay ? "day" : "minute"}
        errorMessage="Inserire una data prima dell'inizio dell'evento"
      />
      <Select
        label="Frequenza ripetizione"
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
        <SelectItem key="Minuto" value="minute">
          Minuto
        </SelectItem>
        <SelectItem key="Oraria" value="hour">
          Oraria
        </SelectItem>
        <SelectItem key="Giornaliera" value="day">
          Giornaliera
        </SelectItem>
        <SelectItem key="Settimanale" value="week">
          Settimanale
        </SelectItem>
        <SelectItem key="Mensile" value="month">
          Mensile
        </SelectItem>
        <SelectItem key="Annuale" value="year">
          Annuale
        </SelectItem>
      </Select>
      <Input
        label="Intervallo ripetizione"
        value={notification?.repetition?.interval?.toString() || ""}
        onChange={(e) => handleNotificationChange("repetition.interval", e.target.value)}
        placeholder="Inserisci l'intervallo di ripetizione"
      />
    </div>
  );
};

export default NotificationMenu;
