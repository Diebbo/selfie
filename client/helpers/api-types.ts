import { TaskModel } from './types';
export interface Response {
  success: boolean;
  message: string;
}

export interface TaskResponse extends Response {
  activity: TaskModel;
}

export interface TaskMutiResponse extends Response {
  activities: TaskModel[];
}

