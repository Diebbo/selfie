"use client";

import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Checkbox,
} from "@nextui-org/react";
import { TaskModel } from "@/helpers/types";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<TaskModel>) => void;
  isSubtask?: boolean;
  parentTaskName?: string;
}

export async function CreateTaskModal({
  isOpen,
  onClose,
  onSave,
  isSubtask = false,
  parentTaskName
}: CreateTaskModalProps) {
  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [completed, setCompleted] = useState(false);

  const handleSave = () => {
    onSave({
      name,
      dueDate: new Date(dueDate),
      completed,
      subActivity: [],
      participants: [],
      uid: "",
    });

    // Reset form
    setName("");
    setDueDate("");
    setCompleted(false);
    onClose();
  };

  return (
    
  );
}


