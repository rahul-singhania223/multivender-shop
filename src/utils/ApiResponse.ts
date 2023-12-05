class ApiResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: object | null;

  constructor(
    success: boolean,
    statusCode: number,
    message: string,
    data: object | null
  ) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

export { ApiResponse };
