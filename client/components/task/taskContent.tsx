'use client';

import { addTask, addTaskToParent, saveTask, saveTaskInParent } from "@/actions/tasks";
import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { People, Person, TaskModel } from "@/helpers/types";
import { Circle, ChevronDown, ChevronRight, Edit } from "lucide-react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Checkbox, Button } from "@nextui-org/react";
import { TaskResponse } from "@/helpers/api-types";

interface TaskItemProps {
  task: TaskModel;
  level: number;
  onAddSubtask: null | ((task: TaskModel) => void);
  onEditTask: (task: TaskModel) => void;
  onTaskUpdate: (task: TaskModel) => void;
}

const TaskItem = ({ task, level, onAddSubtask, onEditTask, onTaskUpdate }: TaskItemProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasSubTasks = task.subActivities && task.subActivities.length > 0;

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
            onPress={() => { if (onAddSubtask) onAddSubtask(task) }}
            aria-label="Add subtask"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {hasSubTasks && isExpanded && (
        <div className="w-full">
          {task.subActivities.map((subtask) => (
            <TaskItem
              key={subtask._id}
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
  currentDate?: Date;
  friends?: Partial<People>;
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
  const defaultState = {
    name: "",
    dueDate: props.currentDate || new Date(),
    completed: false,
  };
  const [formTask, setFormTask] = useState<Partial<TaskModel>>(defaultState);

  const resetForm = () => {
    setSelectedTask(null);
    setSelectedParentTask(null);
    setFormTask(defaultState);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
    setError(null);
  };

  const handleEditTask = (task: TaskModel) => {
    setSelectedTask(task);
    setFormTask({ ...task, dueDate: new Date(task.dueDate) });
    setIsModalOpen(true);
  };

  const handleTaskUpdate = async (updatedTask: TaskModel) => {
    setError(null);
    let fetchedTask: TaskResponse;

    try {
      if (selectedParentTask) {
        fetchedTask = await saveTaskInParent(updatedTask, selectedParentTask);

        if (!fetchedTask.success) {
          throw new Error(fetchedTask.message);
        }

        startTransition(() => {
          setTasks((prevTasks) => {
            return prevTasks.map((task) => {
              if (task._id === selectedParentTask._id) {
                return fetchedTask.activity;
              }
              return task;
            });
          });
        });

      } else {
        fetchedTask = await saveTask(updatedTask);
        if (!fetchedTask.success) {
          throw new Error(fetchedTask.message);
        }
        startTransition(() => {
          setTasks((prevTasks) => {
            return prevTasks.map((task) => {
              if (task._id === fetchedTask.activity._id) {
                return fetchedTask.activity;
              }
              return task;
            });
          });
        });
      }
      // Update the local state with the new tasks

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
    let fetchedTask: TaskResponse;

    try {
      // Wrap the state updates in startTransition, but keep the async operations outside
      if (selectedParentTask) {
        fetchedTask = await addTaskToParent(newTask, selectedParentTask);
        if (!fetchedTask.success) {
          throw new Error(fetchedTask.message);
        }

        startTransition(() => {
          setTasks((prevTasks) => {
            return prevTasks.map((task) => {
              if (task._id === selectedParentTask._id) {
                return fetchedTask.activity;
              }
              return task;
            });
          });
        });
      } else {
        fetchedTask = await addTask(newTask);
        if (!fetchedTask.success) {
          throw new Error(fetchedTask.message);
        }

        startTransition(() => {
          setTasks((prevTasks) => [...prevTasks, fetchedTask.activity]);
        });
      }

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
    if (selectedTask) {
      await handleTaskUpdate({ ...selectedTask, ...formTask });
    } else {
      await handleAddTask(formTask);
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
                {tasks.filter((task) => task.completed).length > 0 && (
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
                )}
                {tasks.filter((task) => !task.completed).length > 0 && (
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
                )}
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
                value={formTask.name || ""}
                onChange={(e) => setFormTask({ ...formTask, name: e.target.value })}
                disabled={isPending}
                required
              />
              <Input
                type="date"
                label="Data di scadenza"
                typeof="date"
                value={formTask.dueDate?.toISOString().split('T')[0]}
                onChange={(e) => {
                  // check if the target value is a valid date
                  if (isNaN(new Date(e.target.value).getTime())) {
                    return;
                  }
                  setFormTask({
                    ...formTask, dueDate: new Date(e.target.value)
                  })
                }}
                disabled={isPending}
              />
              <Checkbox
                isSelected={formTask.completed}
                onChange={() => setFormTask({ ...formTask, completed: !formTask.completed })}
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
              isDisabled={!formTask.name || !formTask.dueDate}
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
