import type { AxiosError } from "axios";

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}

export type ApiError = AxiosError<{
  message?: string;
  error?: string;
}>;
