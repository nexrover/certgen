export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR"
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class TemplateNotFoundError extends AppError {
  constructor(id: string) {
    super(`Template not found: ${id}`, 404, "TEMPLATE_NOT_FOUND");
    this.name = "TemplateNotFoundError";
  }
}

export class JobNotFoundError extends AppError {
  constructor(id: string) {
    super(`Job not found: ${id}`, 404, "JOB_NOT_FOUND");
    this.name = "JobNotFoundError";
  }
}

export class StorageError extends AppError {
  constructor(message: string) {
    super(`Storage error: ${message}`, 500, "STORAGE_ERROR");
    this.name = "StorageError";
  }
}

export class CSVParseError extends AppError {
  constructor(message: string) {
    super(message, 400, "CSV_PARSE_ERROR");
    this.name = "CSVParseError";
  }
}
