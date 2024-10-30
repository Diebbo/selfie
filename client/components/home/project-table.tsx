import React from 'react';
import { Person, ProjectModel } from '@/helpers/types';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  User,
  Tooltip,
  Chip,
} from "@nextui-org/react";
import { CalendarIcon, UsersIcon } from "lucide-react";

interface columnsModel {
  name: string;
  uid: string;
}

// Define table columns
const columns: columnsModel[] = [
  { name: "PROJECT", uid: "title" },
  { name: "DESCRIPTION", uid: "description" },
  { name: "CREATOR", uid: "creator" },
  { name: "PARTICIPANTS", uid: "participants" },
  { name: "DEADLINE", uid: "deadline" },
  { name: "PROGRESS", uid: "progress" },
];

interface RenderCellProps {
  project: ProjectModel;
  columnKey: string;
  creator?: Person;
}

// Component to render different cell content based on column type
const RenderCell: React.FC<RenderCellProps> = ({ project, columnKey, creator }) => {
  switch (columnKey) {
    case "title":
      return (
        <div className="flex flex-col">
          <p className="text-bold text-small capitalize">{project.title}</p>
          <p className="text-bold text-tiny capitalize text-default-400">
            Created: {new Date(project.creationDate).toDateString()}
          </p>
        </div>
      );

    case "description":
      return (
        <div className="flex flex-col">
          <p className="text-bold text-small">
            {project.description.length > 100
              ? `${project.description.substring(0, 100)}...`
              : project.description}
          </p>
        </div>
      );

    case "creator":
      return (
        <User
          name={creator?.username}
          description={creator?.email}
          avatarProps={{
            src: creator?.avatar
          }}
        />
      );

    case "participants":
      return (
        <div className="flex items-center gap-2">
          <UsersIcon className="w-4 h-4" />
          <span>{project.members.length}</span>
          <Tooltip
            content={
              <div className="px-1 py-2">
                {project.members.map(participant => (
                  <div key={participant} className="text-small">
                    {participant}
                  </div>
                ))}
              </div>
            }
          >
            <span className="cursor-pointer text-default-400 text-small">View all</span>
          </Tooltip>
        </div>
      );

    case "deadline":
      return (
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" />
          <span>{""}</span>
          <Chip
            size="sm"
            color={project.activities.filter(task => !task.completed).length === 0 ? "success" : "warning"}
          >
            {new Date(project.deadline).toDateString()}
          </Chip>
        </div>
      );

    case "progress":
      const completedTasks = project.activities.filter(task => task.completed).length;
      const progress = project.activities.length > 0 ? Math.round((completedTasks / project.activities.length) * 100) : 0;
      return (
        <Chip
          className="capitalize"
          color={progress === 100 ? "success" : progress >= 50 ? "warning" : "danger"}
          size="sm"
          variant="flat"
        >
          {progress}%
        </Chip>
      );

    default:
      return null;
  }
};

interface ProjectComponentProps {
  projects: ProjectModel[];
  creator?: Person;
}

export const ProjectTable: React.FC<ProjectComponentProps> = ({ projects, creator }) => {
  console.log(creator?.avatar);
  return (
    <div className="w-full flex flex-col gap-4">
      <Table aria-label="Project table with custom cells">
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "progress" ? "center" : "start"}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={projects}>
          {(item) => (
            <TableRow key={item._id}>
              {(columnKey) => (
                <TableCell>
                  <RenderCell
                    project={item}
                    columnKey={columnKey.toString()}
                    creator={creator}
                  />
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
