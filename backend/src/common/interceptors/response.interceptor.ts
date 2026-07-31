import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          'message' in data
        ) {
          return data as unknown as ApiResponse<T>;
        }

        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          'meta' in data
        ) {
          const wrapped = data as {
            data: T;
            meta?: Record<string, unknown> | null;
            message?: string;
          };
          return {
            success: true,
            data: wrapped.data,
            meta: wrapped.meta ?? null,
            message: wrapped.message ?? 'OK',
          };
        }

        if (
          data &&
          typeof data === 'object' &&
          'message' in data &&
          !('accessToken' in data)
        ) {
          const record = data as Record<string, unknown>;
          const { message, ...rest } = record;
          const restKeys = Object.keys(rest);
          return {
            success: true,
            data: (restKeys.length ? rest : null) as T,
            meta: null,
            message: String(message),
          };
        }

        return {
          success: true,
          data: data ?? null,
          meta: null,
          message: 'OK',
        };
      }),
    );
  }
}
