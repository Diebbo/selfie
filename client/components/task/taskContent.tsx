"use client";

import React, { useState } from "react";
import {
  Card,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Checkbox,
} from "@nextui-org/react";
import { Circle, ChevronRight, ChevronDown, Plus } from "lucide-react";

interface TaskModel {
  name: string;
  dueDate: Date;
  completed: boolean;
  participants: any[];
  subActivity: TaskModel[];
  uid: string;
  parentId?: any;
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<TaskModel>) => void;
  isSubtask?: boolean;
  parentTaskName?: string;
}

const CreateTaskModal = ({
  isOpen,
  onClose,
  onSave,
  isSubtask = false,
  parentTaskName
}: CreateTaskModalProps) => {
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
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          {isSubtask
            ? `Aggiungi sotto-attività a "${parentTaskName}"`
            : "Crea nuova attività"
          }
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <Input
              label="Nome attività"
              placeholder="Inserisci il nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              type="date"
              label="Data di scadenza"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <Checkbox
              isSelected={completed}
              onValueChange={setCompleted}
            >
              Completata
            </Checkbox>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Annulla
          </Button>
          <Button color="primary" onPress={handleSave}>
            Salva
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

interface TaskItemProps {
  task: TaskModel;
  level: number;
  onAddSubtask: (parentTask: TaskModel) => void;
}

const TaskItem = ({ task, level, onAddSubtask }: TaskItemProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasSubTasks = task.subActivity && task.subActivity.length > 0;

  console.log("ci siamo?");
  console.log("ma allora?", task);
  return (
    <div className="w-full">
      <div
        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg"
        style={{ paddingLeft: `${level * 1.5}rem` }}
      >
        {hasSubTasks && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-200 rounded-full"
          >
            {isExpanded ?
              <ChevronDown className="w-4 h-4 text-gray-500" /> :
              <ChevronRight className="w-4 h-4 text-gray-500" />
            }
          </button>
        )}
        {!hasSubTasks && <div className="w-6" />}
        <Circle className="w-4 h-4 text-blue-500" fill={task.completed ? "currentColor" : "none"} />
        <span className="text-sm flex-grow">{task.name}</span>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={() => onAddSubtask(task)}
          className="opacity-0 group-hover:opacity-100"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {hasSubTasks && isExpanded && (
        <div className="w-full">
          {task.subActivity.map((subtask, index) => (
            <TaskItem
              key={subtask.uid || index}
              task={subtask}
              level={level + 1}
              onAddSubtask={onAddSubtask}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface TaskContentProps {
  tasks: TaskModel[];
}

const Content = ({ tasks }: TaskContentProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedParentTask, setSelectedParentTask] = useState<TaskModel | null>(null);

  async function addTask(task: Partial<TaskModel>, parentTask: TaskModel | null) {
    try {
      console.log("ohi 1");
      var res;
      // new sub task
      if (parentTask != null) {
        res = await fetch(`/api/activities/${task.parentId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ activity: task }),
        });
        // new parent task
      } else {
        res = await fetch(`/api/activities`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ activity: task }),
        });

      }

      if (!res?.ok) {
        const errorData = res;
        console.error("error from server:", errorData);
        return false;
      }
    } catch (error) {
      console.error("Error saving task:", error);
      return false;
    }
  }

  const handleAddTask = (newTask: Partial<TaskModel>) => {
    addTask(newTask, selectedParentTask);
  }

  const handleAddSubtask = (parentTask: TaskModel) => {
    setSelectedParentTask(parentTask);
    setIsModalOpen(true);
  };

  return (
    <>
      <Card className="w-full p-4 relative min-h-[200px]">
        {Array.isArray(Object.entries(tasks)) && tasks.length > 0 ? (
          <div className="flex flex-col gap-1">
            {tasks.map((task, index) => (
              <TaskItem
                key={index}
                task={task}
                level={0}
                onAddSubtask={handleAddSubtask}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            Nessuna attività
          </div>
        )}

        <Button
          isIconOnly
          color="primary"
          size="lg"
          className="fixed rounded-[100px] bottom-6 right-6"
          onPress={() => {
            setSelectedParentTask(null);
            setIsModalOpen(true);
          }}
        >
          <Plus />
        </Button>
      </Card>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedParentTask(null);
        }}
        onSave={handleAddTask}
        isSubtask={!!selectedParentTask}
        parentTaskName={selectedParentTask?.name}
      />
    </>
  );
};

export default Content;
