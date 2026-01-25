import { Response } from 'express';
import { IApiResponse, HTTP_CONSTANTS } from '@dam/shared';

export class ResponseUtil {
  static success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = HTTP_CONSTANTS.STATUS.OK
  ): void {
    const response: IApiResponse<T> = {
      success: true,
      data,
      message,
    };
    res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message?: string): void {
    this.success(res, data, message, HTTP_CONSTANTS.STATUS.CREATED);
  }

  static error(
    res: Response,
    error: string,
    statusCode: number = HTTP_CONSTANTS.STATUS.BAD_REQUEST
  ): void {
    const response: IApiResponse<null> = {
      success: false,
      error,
    };
    res.status(statusCode).json(response);
  }

  static unauthorized(res: Response, error?: string): void {
    this.error(res, error || 'Unauthorized', HTTP_CONSTANTS.STATUS.UNAUTHORIZED);
  }

  static notFound(res: Response, error?: string): void {
    this.error(res, error || 'Resource not found', HTTP_CONSTANTS.STATUS.NOT_FOUND);
  }

  static serverError(res: Response, error?: string): void {
    this.error(res, error || 'Internal server error', HTTP_CONSTANTS.STATUS.INTERNAL_SERVER_ERROR);
  }
}
