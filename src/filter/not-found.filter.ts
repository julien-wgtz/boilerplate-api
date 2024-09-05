import { ExceptionFilter, Catch, ArgumentsHost, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Tu peux personnaliser le contenu de la page 404 ici
    response
      .status(HttpStatus.NOT_FOUND)
      .json({
        statusCode: HttpStatus.NOT_FOUND,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: 'La page que vous cherchez n\'existe pas.',
      });
  }
}
