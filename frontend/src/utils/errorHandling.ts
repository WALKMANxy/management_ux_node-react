// utils/errorHandling.ts

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

class ServerError extends Error {
  constructor(status: number, message: string) {
    super(`Server Error (Status ${status}): ${message}`);
    this.name = "ServerError";
  }
}

// Logger utility function
const logError = (error: Error) => {
  console.error(
    `[${new Date().toISOString()}] ${error.name}: ${error.message}`
  );
};

const handleApiError = (error: any, operation: string) => {
  if (error.status) {
    // This is a response error from the server
    const serverError = new ServerError(
      error.status,
      `Error during ${operation}: ${error.data?.message || "Unknown error"}`
    );
    logError(serverError);
  } else {
    // This is likely a network or other type of error
    const networkError = new NetworkError(
      `Network error during ${operation}: ${error.message}`
    );
    logError(networkError);
  }
};

const generateErrorResponse = (error: any) => {
  if (error.status) {
    return {
      error: {
        status: error.status,
        error: error.data?.message || "Unknown error",
      },
    };
  } else {
    return { error: { status: "CUSTOM_ERROR", error: error.message } };
  }
};

export {
  NetworkError,
  ServerError,
  logError,
  handleApiError,
  generateErrorResponse,
};
