import { AppError } from "./AppError";

// Type guard: tells TS that "value is record"
export function assertIsObject(
  value: unknown,
  errorMessage = "Invalid request body"
): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new AppError(errorMessage, 400);
  }
}
