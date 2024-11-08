"use client";

import React, { useState } from "react";
import {
  Card,
  Input,
  Button,
  Switch,
  Spacer,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  ModalContent,
  Avatar,
} from "@nextui-org/react";
import { DarkModeSwitch } from "../navbar/darkmodeswitch";
import { PassLockIcon } from "../auth/PassLockIcon";
import NotificationSettings from "../auth/NotificationSettings";
import { useRouter } from "next/navigation";
import { SelfieEvent } from "@/helpers/types";
import ImportExportCal from "./importExportCal"

interface SettingsPageProps {
  username: string;
  email: string;
  events: SelfieEvent[] | null;
  pushNotifications: boolean;
  emailNotifications: boolean;
  avatar: string;
}

const SettingsPage: React.FC<SettingsPageProps> = (props) => {
  const router = useRouter();
  console.log("avatar", props.avatar);
  const [avatar, setAvatar] = useState(props.avatar);
  const [username, setUsername] = useState(props.username);
  const [usernameEdit, setUsernameEdit] = useState(false);
  const [email, setEmail] = useState(props.email);
  const [emailEdit, setEmailEdit] = useState(false);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatNewPassword, setRepeatNewPassword] = useState("");
  const [pushNotifications, setPushNotifications] = useState(
    props.pushNotifications,
  );
  const [emailNotifications, setEmailNotifications] = useState(
    props.emailNotifications,
  );
  const [statusPasswordChange, setStatusPasswordChange] = useState("");
  const [errorMessageNotification, setErrorMessageNotification] = useState("");
  const [errorMessageDelete, setErrorMessageDelete] = useState("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const validateEmail = (email: string) =>
    email.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);

  const isInvalid = React.useMemo(() => {
    if (email === "") return false;

    return validateEmail(email) ? false : true;
  }, [email]);

  const handleSave = async (type: string) => {
    setErrorMessageNotification(""); // Resetta il messaggio di errore all'inizio
    let body = {};
    let url = "/api/auth/" + type;

    switch (type) {
      case "avatar":
        body = { avatar: avatar };
        url = "/api/users/avatar";
        break;
      case "username":
        body = { username: username };
        break;
      case "email":
        body = { email: email };
        break;
      case "password":
        if (password === "" || newPassword === "" || repeatNewPassword === "") {
          setErrorMessageNotification("Inserisci tutte le password");
          return;
        }
        if (newPassword !== repeatNewPassword) {
          setErrorMessageNotification("Le password non corrispondono");
          return;
        }
        body = {
          currentPassword: password,
          newPassword: newPassword,
        };
        break;
      default:
        console.error("Tipo non supportato:", type);
        return;
    }

    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json();
      setErrorMessageNotification(err.message);
      return;
    }
    if (type === "username") {
      setUsernameEdit(false);
      const event = new CustomEvent("usernameUpdated", { detail: username });
      window.dispatchEvent(event);
    } else if (type === "password") {
      setPassword("");
      setNewPassword("");
      setRepeatNewPassword("");
      setStatusPasswordChange("Password cambiata con successo");
    } else if (type === "email") {
      setEmailEdit(false);
      const event = new CustomEvent("emailUpdated", { detail: { updatedEmail: email } });
      window.dispatchEvent(event);
    } else if (type === "avatar") {
      const event = new CustomEvent("avatarUpdated", { detail: { updatedAvatar: avatar } });
      window.dispatchEvent(event);
    }
  };

  const handleDeleteAccount = async () => {
    const res = await fetch("/api/auth/account", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: password }),
    });
    if (!res.ok) {
      const err = await res.json();
      setErrorMessageDelete(err.message);
      return;
    }
    router.push("/login");
  };

  const handleNotifications = async (type: string) => {
    let body = {};
    if (type === "push") {
      body = { enable: !pushNotifications };

    } else if (type === "email") {
      body = { enable: !emailNotifications };

    } else {
      console.error("Tipo non supportato:", type);
      return;
    }

    const res = await fetch("/api/auth/notifications/" + type, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="max-w-[600px] mx-auto m-auto p-5 w-full">
        <h1 className="flex text-2xl font-bold text-foreground mb-5 justify-center">
          Impostazioni Account
        </h1>
        <Spacer y={1} />
        <h3 className="text-lg mb-5">Cambia Avatar</h3>
        <div className="flex f-row justify-between gap-2">
          <Avatar
            src={avatar}
            size="lg"
            alt="avatar"
          />
          <Input
            variant="faded"
            label="Avatar"
            placeholder="Inserisci il tuo link avatar"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSave("avatar");
              }
            }}
            className="mr-3 w-full"
          />
        </div>

        <Spacer y={5} />

        <h3 className="text-lg mb-5">Cambia Username</h3>
        <div className="flex ">
          <Input
            isDisabled={!usernameEdit}
            variant="faded"
            label="Username"
            placeholder="Inserisci il tuo nuovo username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mr-3 w-full"
          />
          {usernameEdit ? (
            <Button
              variant="light"
              color="danger"
              className="mt-2"
              onClick={() => {
                setUsernameEdit(false);
                handleSave("username");
              }}
            >
              Save
            </Button>
          ) : (
            <Button
              variant="light"
              color="primary"
              className="mt-2"
              onClick={() => setUsernameEdit(true)}
            >
              Change
            </Button>
          )}
        </div>
        <Spacer y={5} />

        <h3 className="text-lg mb-5">Cambia Email</h3>
        <div className="flex ">
          <Input
            isDisabled={!emailEdit}
            variant="faded"
            label="Email"
            placeholder="Inserisci la tua nuova email"
            value={email}
            isInvalid={isInvalid}
            errorMessage="Please enter a valid email"
            onChange={(e) => setEmail(e.target.value)}
            className="mr-3 w-full"
          />
          {emailEdit ? (
            <Button
              variant="light"
              color="danger"
              className="mt-2"
              onClick={() => handleSave("email")}
            >
              Save
            </Button>
          ) : (
            <Button
              variant="light"
              color="primary"
              className="mt-2"
              onClick={() => setEmailEdit(true)}
            >
              Change
            </Button>
          )}
        </div>
        <Spacer y={5} />

        <h3 className="text-lg mb-5">Cambia Password</h3>
        <Input
          isRequired
          variant="faded"
          label="Password Attuale"
          placeholder="Inserisci la password attuale"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrorMessageNotification("");
            setStatusPasswordChange("");
          }}
          type="password"
        />
        <Spacer y={5} />
        <Input
          isRequired
          variant="faded"
          label="Nuova Password"
          placeholder="Inserisci la nuova password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            setErrorMessageNotification("");
            setStatusPasswordChange("");
          }}
          type="password"
        />
        <Spacer y={5} />
        <Input
          isRequired
          variant="faded"
          label="Ripeti la Nuova Password"
          placeholder="Ripeti la nuova password"
          value={repeatNewPassword}
          onChange={(e) => {
            setRepeatNewPassword(e.target.value);
            setErrorMessageNotification("");
            setStatusPasswordChange("");
          }}
          type="password"
        />
        {errorMessageNotification && (
          <div className="text-red-500 mt-3">{errorMessageNotification}</div>
        )}
        {statusPasswordChange && (
          <div className="text-green-500 mt-3">{statusPasswordChange}</div>
        )}
        <Spacer y={5} />
        <Button
          variant="ghost"
          color="primary"
          onClick={() => handleSave("password")}
        >
          Cambia Password
        </Button>

        <Spacer y={10} />

        <h3 className="text-lg mb-3">Notifiche Email</h3>
        <Switch
          isSelected={emailNotifications}
          onChange={async () => {
            await handleNotifications("email");
            setEmailNotifications(!emailNotifications);
          }}
        >
          {emailNotifications ? "Attive" : "Disattive"}
        </Switch>

        <Spacer y={4} />

        <h3 className="text-lg mb-3">Notifiche Push</h3>
        <Switch
          isSelected={pushNotifications}
          onChange={() => {
            handleNotifications("push");
            setPushNotifications(!pushNotifications);
          }}
        >
          {pushNotifications ? "Attive" : "Disattive"}
        </Switch>

        <Spacer y={4} />

        <NotificationSettings />
        <Spacer y={4} />
        <div className="flex flex-row mb-7 gap-10">
          <div className="flex flex-col w-[150px]">
            <h3 className="mb-3">Change Theme</h3>
            <DarkModeSwitch />
          </div>

        </div>

        <ImportExportCal
          events={props.events}
        />

        <Button color="danger" onPress={onOpen} className="w-full">
          Elimina Account
        </Button>
      </Card>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="blur"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col items-center font-bold text-2xl">
                Deleting Account
              </ModalHeader>
              <ModalBody>
                <p>
                  Sei sicuro di voler eliminare il tuo account? Tutti i tuoi
                  dati verrano persi per sempre.
                </p>
                <p className="text-red-700 items-center font-bold flex flex-col mb-4">
                  Questa azione è irreversibile.
                </p>
                <p>Per favore, inserisci la tua password per confermare.</p>
                <Input
                  isRequired
                  label="Password"
                  placeholder="Inserisci la tua password"
                  type="password"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessageDelete("");
                  }}
                  endContent=<PassLockIcon />
                />
                {errorMessageDelete && (
                  <div className="text-red-500 mt-1 flex justify-center">
                    {errorMessageDelete}
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="flex justify-between">
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="danger" onPress={handleDeleteAccount}>
                  Confirm
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default SettingsPage;
