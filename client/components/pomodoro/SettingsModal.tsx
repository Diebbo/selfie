import React from "react";
import {
  Modal,
  Input,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalContent,
  Button,
} from "@nextui-org/react";

interface SettingsModalProps {
  isOpen: boolean;
  isRunning: boolean;
  onClose: () => void;
  focusTimeInput: number;
  setFocusTimeInput: React.Dispatch<React.SetStateAction<number>>;
  breakTimeInput: number;
  setBreakTimeInput: React.Dispatch<React.SetStateAction<number>>;
  longBreakTimeInput: number;
  setLongBreakTimeInput: React.Dispatch<React.SetStateAction<number>>;
  handleSaveSettings: (now: boolean) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  isRunning,
  onClose,
  focusTimeInput,
  setFocusTimeInput,
  breakTimeInput,
  setBreakTimeInput,
  longBreakTimeInput,
  setLongBreakTimeInput,
  handleSaveSettings,
}) => (
  <Modal isOpen={isOpen} onOpenChange={onClose}>
    <ModalContent>
      {(onClose) => (
        <>
          <ModalHeader>
            <h2>Impostazioni</h2>
          </ModalHeader>
          <ModalBody>
            <Input
              label="Durata Focus Time (minuti)"
              type="number"
              value={focusTimeInput.toString()}
              onChange={(e) => setFocusTimeInput(Number(e.target.value))}
              fullWidth
            />
            <Input
              label="Durata Break Time (minuti)"
              type="number"
              value={breakTimeInput.toString()}
              onChange={(e) => setBreakTimeInput(Number(e.target.value))}
              fullWidth
            />
            <Input
              label="Durata Long Break Time (minuti)"
              type="number"
              value={longBreakTimeInput.toString()}
              onChange={(e) =>
                setLongBreakTimeInput(Number(e.target.value))
              }
              fullWidth
            />
          </ModalBody>
          <ModalFooter>
            {isRunning ? (
              <>
              <Button
                onClick={() => {
                handleSaveSettings(false);
                onClose();
                }}
              >
                Salva per il prossimo pomodoro
              </Button>
              </>
            ) : (
              <Button
              onClick={() => {
                handleSaveSettings(true);
                onClose();
              }}
              >
              Salva
              </Button>
            )}
          </ModalFooter>
        </>
      )}
    </ModalContent>
  </Modal>
);

export default SettingsModal;