'use client'

import { addTask, addTaskToParent, saveTask, saveTaskInParent } from "@/actions/tasks";
import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { TaskModel } from "@/helpers/types";
import { Circle, ChevronDown, ChevronRight, Edit } from "lucide-react";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Checkbox,
  Button,
  Card,
} from "@nextui-org/react";

interface TaskItemProps {
  task: TaskModel;
  level: number;
  onAddSubtask: (task: TaskModel) => void;
  onEditTask: (task: TaskModel) => void;
  onTaskUpdate: (task: TaskModel) => void;
}

const TaskItem = ({ task, level, onAddSubtask, onEditTask, onTaskUpdate }: TaskItemProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasSubTasks = task.subActivity && task.subActivity.length > 0;

  const handleStatusChange = () => {
    onTaskUpdate({ ...task, completed: !task.completed });
  };

  return (
    <div className="w-full">
      <div
        className="flex items-center gap-2 p-2 hover:bg-primary rounded-lg group"
        style={{ paddingLeft: `${level * 1.5}rem` }}
      >
        {hasSubTasks ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-200 rounded-full"
            aria-label={isExpanded ? "Collapse task" : "Expand task"}
          >
            {isExpanded ?
              <ChevronDown className="w-4 h-4 text-gray-500" /> :
              <ChevronRight className="w-4 h-4 text-gray-500" />
            }
          </button>
        ) : (
          <div className="w-6" aria-hidden="true" />
        )}

        <button
          onClick={handleStatusChange}
          className="flex items-center"
          aria-label={`Mark task ${task.completed ? 'incomplete' : 'complete'}`}
        >
          <Circle
            className="w-4 h-4 text-blue-500"
            fill={task.completed ? "currentColor" : "none"}
          />
        </button>

        <span className="text-sm flex-grow">{task.name}</span>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => onEditTask(task)}
            aria-label="Edit task"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => onAddSubtask(task)}
            aria-label="Add subtask"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {hasSubTasks && isExpanded && (
        <div className="w-full">
          {task.subActivity.map((subtask, index) => (
            <TaskItem
              key={subtask.uid || `subtask-${index}`}
              task={subtask}
              level={level + 1}
              onAddSubtask={onAddSubtask}
              onEditTask={onEditTask}
              onTaskUpdate={onTaskUpdate}
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

const Content = (props: TaskContentProps) => {
  // Regular state
  const [tasks, setTasks] = useState(props.tasks);
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskModel | null>(null);
  const [selectedParentTask, setSelectedParentTask] = useState<TaskModel | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [completed, setCompleted] = useState(false);

  const resetForm = () => {
    setName("");
    setDueDate(new Date());
    setCompleted(false);
    setSelectedTask(null);
    setSelectedParentTask(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
    setError(null);
  };

  const handleEditTask = (task: TaskModel) => {
    setSelectedTask(task);
    setName(task.name);
    setDueDate(task.dueDate || new Date());
    setCompleted(task.completed);
    setIsModalOpen(true);
  };

  const handleTaskUpdate = async (updatedTask: TaskModel) => {
    setError(null);

    try {
      startTransition(async () => {
        if (selectedParentTask) {
          await saveTaskInParent(updatedTask, selectedParentTask);
        } else {
          await saveTask(updatedTask);
        }
      });
      handleCloseModal();
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save task";
      setError(errorMessage);
      console.error("Error saving task:", error);
      return false;
    }
  };

  const handleAddTask = async (newTask: Partial<TaskModel>) => {
    setError(null);
    try {
      // Perform the actual server update
      startTransition(async () => {
        if (selectedParentTask) {
          await addTaskToParent(newTask, selectedParentTask);
        } else {
          await addTask(newTask);
        }
      });

      handleCloseModal();
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save task";
      setError(errorMessage);
      console.error("Error saving task:", error);
      return false;
    }
  };

  const handleAddSubtask = (parentTask: TaskModel) => {
    setSelectedParentTask(parentTask);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    const taskData: Partial<TaskModel> = {
      name,
      dueDate: dueDate,
      completed
    };

    if (selectedTask) {
      await handleTaskUpdate({ ...selectedTask, ...taskData });
    } else {
      await handleAddTask(taskData);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between m-4 p-4 bg-primary-50 rounded-lg">
        {error && (
          <div className="bg-red-50 text-red-600 p-2 mb-4 rounded">
            {error}
          </div>
        )}


        <div className="flex items-start flex-wrap flex-row gap-2 w-full">
          {
            tasks.length > 0 ? (
              <>
                <div className="min-w-[200px]" id="done">
                  <h2 className="text-lg font-semibold text-primary">Done</h2>
                  <div className="flex flex-col gap-2">
                    {tasks.filter((task) => task.completed).map((task) => (
                      <TaskItem
                        key={task._id}
                        task={task}
                        level={0}
                        onAddSubtask={handleAddSubtask}
                        onEditTask={handleEditTask}
                        onTaskUpdate={handleTaskUpdate}
                      />
                    ))}
                  </div>
                </div>
                <div className="min-w-[200px]" id="done">
                  <h2 className="text-lg font-semibold text-primary">To Do</h2>
                  <div className="flex flex-col gap-2">
                    {tasks.filter((task) => !task.completed).map((task) => (
                      <TaskItem
                        key={task._id}
                        task={task}
                        level={0}
                        onAddSubtask={handleAddSubtask}
                        onEditTask={handleEditTask}
                        onTaskUpdate={handleTaskUpdate}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-warning py-8" role="status">
                Nessuna attività
              </div>
            )
          }
        </div>
        <Button
          isIconOnly
          color="primary"
          size="lg"
          className="fixed rounded-[100px] bottom-6 right-6"
          onPress={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          aria-label="Add new task"
          isDisabled={isPending}
        >
          <Plus />
        </Button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isDismissable={!isPending}
      >
        <ModalContent>
          <ModalHeader>
            {selectedTask
              ? "Modifica attività"
              : selectedParentTask
                ? `Aggiungi sotto-attività a "${selectedParentTask.name}"`
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
                disabled={isPending}
                required
              />
              <Input
                type="date"
                label="Data di scadenza"
                typeof="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isPending}
                required
              />
              <Checkbox
                isSelected={completed}
                onValueChange={setCompleted}
                disabled={isPending}
              >
                Completata
              </Checkbox>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={handleCloseModal}
              isDisabled={isPending}
            >
              Annulla
            </Button>
            <Button
              color="primary"
              onPress={handleSave}
              isLoading={isPending}
              isDisabled={!name.trim() || isPending}
            >
              Salva
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Content;
