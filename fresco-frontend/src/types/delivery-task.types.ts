import { TaskStatus, TaskType } from "../constants/delivery-task.constants";
import { Assignment } from "./assignment.types";
import { Order } from "./order.types";
import { User } from "./auth.types";


/**
 * FRESCO Delivery Task Entity.
 */
export interface DeliveryTask {
  _id: string;
  assignmentId: string | Assignment;
  orderId: string | Order;
  partnerId: string | User;
  taskType: TaskType;
  status: TaskStatus;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryTaskFilters {
  taskType?: TaskType;
  status?: TaskStatus;
  isActive?: boolean;
}

export interface DeliveryTaskResponse {
  task: DeliveryTask;
}

export interface DeliveryTasksResponse {
  tasks: DeliveryTask[];
}
