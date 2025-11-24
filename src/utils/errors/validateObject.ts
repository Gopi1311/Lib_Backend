export function assertIsObject(value: unknown, errorMessage = "Invalid request body") {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw { status: 400, message: errorMessage };
  }
}
