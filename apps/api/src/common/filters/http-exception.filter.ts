import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = "UNKNOWN_ERROR";
    let message = "An unexpected error occurred.";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();

      if (typeof responseBody === "object" && responseBody !== null) {
        const bodyObj = responseBody as Record<string, unknown>;
        code = (bodyObj.code as string) || this.getErrorCodeByStatus(status);
        message = (bodyObj.message as string) || exception.message;
      } else {
        code = this.getErrorCodeByStatus(status);
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
      },
    });
  }

  private getErrorCodeByStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return "INVALID_URL";
      case HttpStatus.NOT_FOUND:
        return "REPOSITORY_NOT_FOUND";
      case HttpStatus.FORBIDDEN:
      case HttpStatus.UNAUTHORIZED:
        return "PRIVATE_REPOSITORY";
      case HttpStatus.TOO_MANY_REQUESTS:
        return "RATE_LIMITED";
      default:
        return "INTERNAL_SERVER_ERROR";
    }
  }
}
