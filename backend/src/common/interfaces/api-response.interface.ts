export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  meta?: Record<string, unknown> | null;
  message: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}
