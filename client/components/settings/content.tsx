"use client";

import React, { useEffect, useState } from "react";
import {
  NextUIProvider,
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
} from "@nextui-org/react";
import { DarkModeSwitch } from "../navbar/darkmodeswitch";
import { PassLockIcon } from "../auth/PassLockIcon";
import { createAuthCookie, deleteAuthCookie } from "@/actions/auth.action";

interface SettingsPageProps {
  username: string;
  email: string;
}

const SettingsPage: React.FC<SettingsPageProps> = (props) => {
  const [username, setUsername] = useState("");
  const [usernameEdit, setUsernameEdit] = useState(false);
  const [email, setEmail] = useState("");
  const [emailEdit, setEmailEdit] = useState(false);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatNewPassword, setRepeatNewPassword] = useState("");
  const [notifications, setNotifications] = useState(true);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleSave = async (type: string) => {
    let body = {};

    switch (type) {
      case "username":
        body = { username: username };
        break;
      case "email":
        body = { email: email };
        break;
      case "password":
        if (newPassword !== repeatNewPassword) {
          // Avvisa l'utente che le password non corrispondono
          // usando una notifica in alto a destra
          // TODO: dobbiamo creare un componente notifica da poter usare ovunque
          console.error("Le password non corrispondono");
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

    const res = await fetch("/api/auth/" + type, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      await deleteAuthCookie();
      return;
    }
    const data = await res.json();
    if (data) {
      await createAuthCookie(data.token);
    }
    window.location.reload();
  };

  return (
    <NextUIProvider>
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-[600px] mx-auto m-auto p-5 w-full">
          <h1 className="text-2xl font-bold text-foreground mb-5">
            Impostazioni Account
          </h1>
          <Spacer y={1} />

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
                onClick={() => handleSave("username")}
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
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />
          <Spacer y={5} />
          <Input
            isRequired
            variant="faded"
            label="Nuova Password"
            placeholder="Inserisci la nuova password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            type="password"
          />
          <Spacer y={5} />
          <Input
            isRequired
            variant="faded"
            label="Ripeti la Nuova Password"
            placeholder="Ripeti la nuova password"
            value={repeatNewPassword}
            onChange={(e) => setRepeatNewPassword(e.target.value)}
            type="password"
          />
          <Spacer y={5} />
          <Button
            variant="ghost"
            color="primary"
            onClick={() => handleSave("password")}
          >
            Cambia Password
          </Button>

          <Spacer y={10} />

          <h3 className="mb-3">Notifiche Push</h3>
          <Switch
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
          >
            {notifications ? "Attive" : "Disattive"}
          </Switch>

          <Spacer y={4} />

          <h3 className="mb-3">Cambia Tema</h3>
          <div>
            <DarkModeSwitch />
          </div>
          <Spacer y={4} />

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
                    endContent=<PassLockIcon />
                  />
                </ModalBody>
                <ModalFooter className="flex justify-between">
                  <Button color="primary" variant="light" onPress={onClose}>
                    Close
                  </Button>
                  <Button color="danger" onPress={onClose}>
                    Confirm
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </NextUIProvider>
  );
};

export default SettingsPage;
