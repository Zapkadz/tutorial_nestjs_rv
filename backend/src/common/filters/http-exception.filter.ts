import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && (res as any).message) {
        message = (res as any).message;
        errors = (res as any).message;
      } else {
        message = res as string;
      }
    }

    response.status(status).json({
      status: 'error',
      message,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
