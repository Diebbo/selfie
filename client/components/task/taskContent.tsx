'use client';

import { addTask, addTaskToParent, saveTask, saveTaskInParent } from "@/actions/tasks";
import { useState, useTransition } from "react";
import { Plus, ListTodo, ListChecks } from "lucide-react";
import { People, Person, TaskModel } from "@/helpers/types";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Checkbox, Button } from "@nextui-org/react";
import { TaskResponse } from "@/helpers/api-types";
import TaskItem from "./taskItem";

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
    const isParent: boolean = tasks.some((task) => task._id === updatedTask._id);

    try {
      if (!isParent) { // Check if the task is a subactivity
        const parentTask = tasks.find((task) => task.subActivities?.some((subtask) => subtask._id === updatedTask._id));
        if (!parentTask) {
          throw new Error("Parent task not found");
        }
        
        // if all subtasks are completed, mark parent task as completed else mark as incomplete
        const allSubtasksCompleted = parentTask.subActivities.every((subtask) => 
          (subtask.completed && subtask._id !== updatedTask._id) || (updatedTask.completed && subtask._id === updatedTask._id)
        );

        if (allSubtasksCompleted) {
          parentTask.completed = true;
        } else {
          parentTask.completed = false;
        }

        fetchedTask = await saveTaskInParent(updatedTask, parentTask);

        if (!fetchedTask.success) {
          throw new Error(fetchedTask.message);
        }

        startTransition(() => {
          setTasks((prevTasks) => {
            return prevTasks.map((task) => {
              if (task._id === parentTask?._id) {
                return fetchedTask.activity;
              }
              return task;
            });
          });
        });

      } else {
        // set status to all subtasks
        updatedTask.subActivities = updatedTask.subActivities.map((subtask) => ({
          ...subtask,
          completed: updatedTask.completed,
        }));

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

        // update parent completion state if all subtasks are completed
        const fetchedParent = await saveTask({
          ...fetchedTask.activity,
          completed: selectedParentTask.completed && (newTask.completed || false),
        });

        startTransition(() => {
          setTasks((prevTasks) => {
            return prevTasks.map((task) => {
              if (task._id === selectedParentTask._id) {
                return fetchedParent.activity;
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
      {error && (
          <div className="bg-red-50 text-danger p-2 mb-4 rounded m-4">
            {error}
          </div>
      )}
      <div className="flex items-center justify-between m-4 p-4 bg-primary-50 rounded-lg">
        <div className="flex items-start flex-col gap-2 w-full">
          {
            tasks.length > 0 ? (
              <>
                {tasks.filter((task) => task.completed).length > 0 && (
                  <div className="min-w-[200px] w-full border-2 rounded-lg border-solid border-primary p-3" id="done">
                    <div className="flex items-center gap-2">
                      <ListChecks className="text-primary" />
                      <h2 className="text-lg font-semibold text-primary">
                        Done
                      </h2>
                    </div>
                    <div className="flex flex-col gap-2">
                      {tasks.filter((task) => task.completed).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map((task) => (
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
                  <div className="min-w-[200px] w-full border-2 rounded-lg border-solid border-warning p-3" id="todo">
                    <div className="flex items-center gap-2">
                      <ListTodo className="text-warning" />
                      <h2 className="text-lg font-semibold text-warning">To Do</h2>
                    </div>
                    <div className="flex flex-col gap-2">
                      {tasks.filter((task) => !task.completed).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map((task) => (
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
