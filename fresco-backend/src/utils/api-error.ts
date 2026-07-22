export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors: readonly ApiErrorDetail[];
  public readonly isOperational: boolean;

  public constructor(
    statusCode: number,
    message: string,
    errors: readonly ApiErrorDetail[] = [],
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, ApiError);
  }
}
