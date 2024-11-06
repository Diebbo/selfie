import { useState } from "react";
import { ChevronDown, ChevronRight, Circle, Edit, Plus } from "lucide-react";
import { TaskModel } from "@/helpers/types";
import { Button } from "@nextui-org/react";

interface TaskItemProps {
  task: TaskModel;
  level: number;
  onAddSubtask: null | ((task: TaskModel) => void);
  onEditTask: (task: TaskModel) => void;
  onTaskUpdate: (task: TaskModel) => void;
  currentDate?: Date;
}

export default function TaskItem ({ task, level, onAddSubtask, onEditTask, onTaskUpdate, currentDate }: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasSubTasks = task.subActivities && task.subActivities.length > 0;

  const handleStatusChange = () => {
    onTaskUpdate({ ...task, completed: !task.completed });
  };

  const formatDate = (date: Date) => {
    date = new Date(date);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getColorDate = (date: Date) => {
      if (!currentDate) {
        return "content4";
      }
      if (new Date(date) < new Date(currentDate)) {
        return "danger";
      } else if (new Date(date).getDate() === new Date(currentDate).getDate()) {
        return "warning";
      } 
      return "content4";
  }


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
          className={"flex items-center"}
          aria-label={`Mark task ${task.completed ? 'incomplete' : 'complete'}`}
        >
          <Circle
            className={"w-4 h-4 text-" + (task.completed ? "primary" : "warning")}
            fill={task.completed ? "currentColor" : "none"}
          />
        </button>

        <span className="text-sm flex-grow">{task.name}</span>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 items-center justify-center">
          <p className={`text-${getColorDate(task.dueDate)} opacity-1 text-center`}>
            {formatDate(task.dueDate)}
          </p>
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


