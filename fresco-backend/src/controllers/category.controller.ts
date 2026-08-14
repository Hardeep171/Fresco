import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { categoryService } from "../services/category.service.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  categoryIdParamSchema,
  createCategorySchema,
  getCategoriesQuerySchema,
  updateCategorySchema,
} from "../validators/category.validator.js";

/** Category controller handling HTTP requests for Category management. */
export const categoryController = {
  /** Create a new category. */
  createCategory: asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const validatedData = createCategorySchema.parse(req.body);

    const category = await categoryService.createCategory(validatedData);

    ApiResponse.send(
      res,
      StatusCodes.CREATED,
      "Category created successfully",
      { category },
    );
  }),

  /** Retrieve categories, optionally filtering by active status. */
  getCategories: asyncHandler(async (req: Request, res: Response) => {
    const filters = getCategoriesQuerySchema.parse(req.query);

    const categories = await categoryService.getCategories(filters);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Categories fetched successfully",
      { categories },
    );
  }),

  /** Retrieve a single category by ID. */
  getCategoryById: asyncHandler(async (req: Request, res: Response) => {
    // Validate request params
    const { id } = categoryIdParamSchema.parse(req.params);

    const category = await categoryService.getCategoryById(id);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Category fetched successfully",
      { category },
    );
  }),

  /** Update an existing category by ID. */
  updateCategory: asyncHandler(async (req: Request, res: Response) => {
    // Validate request params and body
    const { id } = categoryIdParamSchema.parse(req.params);
    const validatedData = updateCategorySchema.parse(req.body);

    const category = await categoryService.updateCategory(id, validatedData);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Category updated successfully",
      { category },
    );
  }),

  /** Disable a category by ID (soft delete). */
  disableCategory: asyncHandler(async (req: Request, res: Response) => {
    // Validate request params
    const { id } = categoryIdParamSchema.parse(req.params);

    const category = await categoryService.disableCategory(id);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Category disabled successfully",
      { category },
    );
  }),

  /** Enable a category by ID. */
  enableCategory: asyncHandler(async (req: Request, res: Response) => {
    // Validate request params
    const { id } = categoryIdParamSchema.parse(req.params);

    const category = await categoryService.enableCategory(id);

    ApiResponse.send(
      res,
      StatusCodes.OK,
      "Category enabled successfully",
      { category },
    );
  }),
};
