// API Error response structure
export interface ApiError {
  success: boolean;
  error: string;
  message?: string;
}

// Type guard to check if error is an ApiError
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof (error as any).error === 'string'
  );
}

// RTK Query error structure
export interface SerializedError {
  data?: ApiError;
  status?: number;
  statusText?: string;
}

export function isSerializedError(error: unknown): error is SerializedError {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('data' in error || 'status' in error)
  );
}