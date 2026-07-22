import type { Response } from "express";

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export class ApiResponse {
  public static send<T>(
    response: Response<ApiSuccessResponse<T>>,
    statusCode: number,
    message: string,
    data: T,
  ): Response<ApiSuccessResponse<T>> {
    return response.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }
}
