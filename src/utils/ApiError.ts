class ApiError extends Error {
  statusCode: number;
  message: string;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode || 500;
    this.message = message || "Internal server error";
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
