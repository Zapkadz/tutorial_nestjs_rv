import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common';

interface AttemptRecord {
  count: number;
  expiresAt: number;
}

@Injectable()
export class LoginRateLimitGuard implements CanActivate {
  private static readonly attempts = new Map<string, AttemptRecord>();
  private static readonly WINDOW_MS = 60_000;
  private static readonly MAX_ATTEMPTS = 5;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const key = this.createKey(request);
    const now = Date.now();
    const record = LoginRateLimitGuard.attempts.get(key);

    if (!record || record.expiresAt <= now) {
      LoginRateLimitGuard.attempts.set(key, {
        count: 1,
        expiresAt: now + LoginRateLimitGuard.WINDOW_MS,
      });
      return true;
    }

    if (record.count >= LoginRateLimitGuard.MAX_ATTEMPTS) {
      throw new HttpException(
        'Too many login attempts. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    record.count += 1;
    LoginRateLimitGuard.attempts.set(key, record);
    return true;
  }

  private createKey(request: any): string {
    const ip = request.ip || request.connection?.remoteAddress || 'unknown';
    const email = request.body?.user?.email || 'unknown';
    return `${ip}:${email}`;
  }
}


