// utils/errorHandling.ts

import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface ErrorWithStatus {
  status: number;
  data?: {
    message?: string;
  };
}

function isErrorWithStatus(error: unknown): error is ErrorWithStatus {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as ErrorWithStatus).status === 'number'
  );
}

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

class ServerError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(`Server Error (Status ${status}): ${message}`);
    this.name = "ServerError";
    this.status = status;
  }
}

class RegistrationError extends Error {
  constructor(message: string) {
    super(`Registration failed: ${message}`);
    this.name = "RegistrationError";
  }
}

class LoginError extends Error {
  constructor(message: string) {
    super(`Login failed: ${message}`);
    this.name = "LoginError";
  }
}

class FetchUserRoleError extends Error {
  constructor(message: string) {
    super(`Failed to fetch user role: ${message}`);
    this.name = "FetchUserRoleError";
  }
}


// Logger utility function
const logError = (error: Error): void => {
  console.error(
    `[${new Date().toISOString()}] ${error.name}: ${error.message}`
  );
};

const handleApiError = (error: unknown, operation: string): void => {
  if (isErrorWithStatus(error)) {
    // This is a response error from the server
    const serverError = new ServerError(
      error.status,
      `Error during ${operation}: ${error.data?.message || "Unknown error"}`
    );
    logError(serverError);
  } else if (error instanceof Error) {
    // This is likely a network or other type of error
    const networkError = new NetworkError(
      `Network error during ${operation}: ${error.message}`
    );
    logError(networkError);
  } else {
    // Unexpected error type
    const unknownError = new Error(`Unknown error during ${operation}`);
    logError(unknownError);
  }
};

// Update the generateErrorResponse to match the expected FetchBaseQueryError format
const generateErrorResponse = (
  error: unknown
): { error: FetchBaseQueryError } => {
  if (isErrorWithStatus(error)) {
    return {
      error: {
        status: error.status,
        data: error.data ?? "Unknown error",
      },
    };
  } else if (error instanceof Error) {
    // Assuming network errors should be treated as FETCH_ERROR
    return {
      error: {
        status: 'FETCH_ERROR',
        error: error.message
      }
    };
  } else if (typeof error === 'string') {
    // Handling string errors as FETCH_ERROR
    return {
      error: {
        status: 'FETCH_ERROR',
        error: error
      },
    };
  } else {
    // Default case for truly unknown errors
    return {
      error: {
        status: 'FETCH_ERROR',
        error: "An unknown error occurred"
      },
    };
  }
};

// Type guard to check if the error is of type ErrorWithStatus

export {
  FetchUserRoleError,
  LoginError,
  NetworkError,
  RegistrationError,
  ServerError,
  generateErrorResponse,
  handleApiError,
  logError,
};
