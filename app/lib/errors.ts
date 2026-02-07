/**
 * Base application error class
 * All custom errors should extend this class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      statusCode: this.statusCode,
    };
  }
}

/**
 * 400 Bad Request - Invalid input or malformed request
 */
export class ValidationError extends AppError {
  public readonly fields?: Record<string, string>;

  constructor(message: string = 'Validation failed', fields?: Record<string, string>) {
    super(message, 400, 'VALIDATION_ERROR');
    this.fields = fields;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      ...(this.fields && { fields: this.fields }),
    };
  }
}

/**
 * 401 Unauthorized - Missing or invalid authentication
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * 403 Forbidden - Authenticated but not authorized
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'FORBIDDEN');
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * 404 Not Found - Resource doesn't exist
 */
export class NotFoundError extends AppError {
  public readonly resource?: string;

  constructor(message: string = 'Resource not found', resource?: string) {
    super(message, 404, 'NOT_FOUND');
    this.resource = resource;
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * 409 Conflict - Resource already exists or state conflict
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * 429 Too Many Requests - Rate limit exceeded
 */
export class RateLimitError extends AppError {
  public readonly retryAfter: number;

  constructor(message: string = 'Too many requests', retryAfter: number = 60) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter,
    };
  }
}

/**
 * 500 Internal Server Error - Unexpected server error
 */
export class InternalError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(message, 500, 'INTERNAL_ERROR', false);
    Object.setPrototypeOf(this, InternalError.prototype);
  }
}

/**
 * 502 Bad Gateway - External service failure
 */
export class ExternalServiceError extends AppError {
  public readonly service: string;

  constructor(message: string = 'External service error', service: string = 'unknown') {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR');
    this.service = service;
    Object.setPrototypeOf(this, ExternalServiceError.prototype);
  }
}

/**
 * 503 Service Unavailable - Temporarily unavailable
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable') {
    super(message, 503, 'SERVICE_UNAVAILABLE');
    Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
  }
}

/**
 * Check if an error is an operational error (expected) vs programming error
 */
export function isOperationalError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Convert any error to an AppError
 */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new InternalError(error.message);
  }

  return new InternalError('An unexpected error occurred');
}

/**
 * Type guard to check if an object is an error response
 */
export function isErrorResponse(obj: unknown): obj is { error: string; status: number } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'error' in obj &&
    'status' in obj
  );
}
