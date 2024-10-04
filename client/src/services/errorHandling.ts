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
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as ErrorWithStatus).status === "number"
  );
}

class AppError extends Error {
  constructor(message: string, name: string) {
    super(message);
    this.name = name;
    Object.setPrototypeOf(this, new.target.prototype); // Restore prototype chain
  }
}

class NetworkError extends AppError {
  constructor(message: string) {
    super(`NetworkError: ${message}`, "NetworkError");
  }
}

class ServerError extends AppError {
  status: number;

  constructor(status: number, message: string) {
    super(`ServerError (Status ${status}): ${message}`, "ServerError");
    this.status = status;
  }
}

class RegistrationError extends AppError {
  constructor(message: string) {
    super(`RegistrationError: ${message}`, "RegistrationError");
  }
}

class LoginError extends AppError {
  constructor(message: string) {
    super(`LoginError: ${message}`, "LoginError");
  }
}

class FetchUserRoleError extends AppError {
  constructor(message: string) {
    super(`FetchUserRoleError: ${message}`, "FetchUserRoleError");
  }
}

// Logger utility function
const logError = (error: Error): void => {
  console.error(`[${new Date().toISOString()}] ${error.name}: ${error.message}`);
};

const handleApiError = (error: unknown, operation: string): void => {
  if (isErrorWithStatus(error)) {
    const serverError = new ServerError(
      error.status,
      `Error during ${operation}: ${error.data?.message || "Unknown error"}`
    );
    logError(serverError);
  } else if (error instanceof Error) {
    const networkError = new NetworkError(
      `Network error during ${operation}: ${error.message}`
    );
    logError(networkError);
  } else {
    const unknownError = new AppError(`Unknown error during ${operation}`, "UnknownError");
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
    return {
      error: {
        status: "FETCH_ERROR",
        error: error.message,
      },
    };
  } else if (typeof error === "string") {
    return {
      error: {
        status: "FETCH_ERROR",
        error: error,
      },
    };
  } else {
    return {
      error: {
        status: "FETCH_ERROR",
        error: "An unknown error occurred",
      },
    };
  }
};

export {
  FetchUserRoleError,
  generateErrorResponse,
  handleApiError,
  logError,
  LoginError,
  NetworkError,
  RegistrationError,
  ServerError,
};
