import React from "react";
import { Input, Select, SelectItem } from "@nextui-org/react";
import { DatePicker } from "@nextui-org/react";
import { SelfieNotification } from "@/helpers/types";

interface NotificationMenuProps {
  value: boolean;
  notification: SelfieNotification;
  onChange: (event: { target: { name: string; value: any } }) => void;
  eventDate: Date;
}

const NotificationMenu: React.FC<NotificationMenuProps> = ({
  value,
  notification,
  onChange,
}) => {
  if (!value) return null;

  const handleNotificationChange = (name: string, value: any) => {
    onChange({
      target: {
        name: `notification.${name}`,
        value,
      },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Titolo notifica"
        value={notification?.title.toString() || ""}
        onChange={(e) => handleNotificationChange("title", e.target.value)}
        placeholder="Inserisci il titolo della notifica"
      />
      <Input
        label="Descrizione notifica"
        value={notification?.description.toString() || ""}
        onChange={(e) =>
          handleNotificationChange("description", e.target.value)
        }
        placeholder="Inserisci la descrizione della notifica"
      />
      <Select
        label="Tipo notifica"
        selectedKeys={
          notification?.type.toString() ? [notification.type.toString()] : []
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
        label="Data di inizio notifiche"
        isRequired
        granularity="minute"
        onChange={(date) => handleNotificationChange("fromDate", date)}
      />
      <Select
        label="Frequenza ripetizione"
        selectedKeys={
          notification?.repetition?.freq?.toString()
            ? [notification.repetition.freq.toString()]
            : []
        }
        onSelectionChange={(value) =>
          handleNotificationChange("repetition.freq", Array.from(value)[0])
        }
      >
        <SelectItem key="minutely" value="minutely">
          Minuto
        </SelectItem>
        <SelectItem key="hourly" value="hourly">
          Oraria
        </SelectItem>
        <SelectItem key="daily" value="daily">
          Giornaliera
        </SelectItem>
        <SelectItem key="weekly" value="weekly">
          Settimanale
        </SelectItem>
        <SelectItem key="monthly" value="monthly">
          Mensile
        </SelectItem>
        <SelectItem key="yearly" value="yearly">
          Annuale
        </SelectItem>
      </Select>
      <Input
        label="Intervallo ripetizione"
        onChange={(e) => handleNotificationChange("repetition.interval", e)}
        placeholder="Inserisci l'intervallo di ripetizione"
      />
    </div>
  );
};

export default NotificationMenu;
