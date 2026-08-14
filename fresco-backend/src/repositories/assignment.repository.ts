import type { QueryFilter as FilterQuery, Types } from "mongoose";

import type { AssignmentType } from "../constants/assignment.constants.js";
import {
  AssignmentModel,
  type Assignment,
} from "../models/assignment.model.js";

/** Repository handling database operations for Assignment module. */
export const assignmentRepository = {
  /**
   * Creates a new assignment document in the database and returns a plain object.
   *
   * @param data - Assignment creation properties.
   * @returns Promise resolving to the created assignment plain object.
   */
  async createAssignment(data: Partial<Assignment>) {
    const assignment = await AssignmentModel.create(data);
    return assignment.toObject();
  },

  /**
   * Finds assignment documents matching the specified filter criteria.
   *
   * @param filters - Optional query filter parameters.
   * @returns Promise resolving to an array of matching assignment plain objects.
   */
  async findAssignments(filters: FilterQuery<Assignment> = {}) {
    return AssignmentModel.find(filters).lean().exec();
  },

  /**
   * Finds a single assignment document by its unique identifier.
   *
   * @param id - The assignment's unique identifier.
   * @returns Promise resolving to the matching assignment plain object if found, or null.
   */
  async findAssignmentById(id: string) {
    return AssignmentModel.findById(id).lean().exec();
  },

  /**
   * Finds all assignment documents for a specific partner matching optional filters.
   *
   * @param partnerId - The partner's unique identifier.
   * @param filters - Optional additional query filter parameters.
   * @returns Promise resolving to an array of matching assignment plain objects.
   */
  async findAssignmentsByPartner(
    partnerId: string | Types.ObjectId,
    filters: FilterQuery<Assignment> = {},
  ) {
    return AssignmentModel.find({ ...filters, partnerId })
      .lean()
      .exec();
  },

  /**
   * Finds a single assignment document for the specified order and assignment type.
   *
   * @param orderId - The order's unique identifier.
   * @param assignmentType - The type of assignment to look up (PICKUP or DELIVERY).
   * @returns Promise resolving to the matching assignment plain object if found, or null.
   */
  async findAssignmentByOrder(
    orderId: string | Types.ObjectId,
    assignmentType: AssignmentType,
  ) {
    return AssignmentModel.findOne({
      orderId,
      assignmentType,
    })
      .lean()
      .exec();
  },

  /**
   * Updates an assignment document by ID and returns a plain object.
   *
   * @param id - The assignment's unique identifier.
   * @param data - Assignment fields to update.
   * @returns Promise resolving to the updated assignment plain object if found, or null.
   */
  async updateAssignment(id: string, data: Partial<Assignment>) {
    return AssignmentModel.findByIdAndUpdate(id, data, {
      returnDocument: "after",
      runValidators: true,
    })
      .lean()
      .exec();
  },

  /**
   * Soft deletes an assignment document by setting isActive to false and returns a plain object.
   *
   * @param id - The assignment's unique identifier.
   * @returns Promise resolving to the updated assignment plain object if found, or null.
   */
  async disableAssignment(id: string) {
    return AssignmentModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { returnDocument: "after", runValidators: true },
    )
      .lean()
      .exec();
  },

  /**
   * Counts total assignment documents matching the specified filter criteria.
   *
   * @param filters - Optional query filter parameters.
   * @returns Promise resolving to the total count of matching assignment documents.
   */
  async countAssignments(filters: FilterQuery<Assignment> = {}) {
    return AssignmentModel.countDocuments(filters).exec();
  },
};
