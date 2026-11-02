import type { ValidationError } from "class-validator";

const DUPLICATE_KEY_CODE = 11000;

const HIDDEN_KEYS = new Set([
  "password",
  "secret",
  "seed",
  "jwt",
  "authorization",
  "cookie",
]);

export type FieldError = {
  field: string;
  constraints: Record<string, string>;
};

export function getAllConstraints(
  errors: ValidationError[],
  parentField = "",
): FieldError[] {
  return errors.flatMap((error) => {
    const field = parentField
      ? `${parentField}.${error.property}`
      : error.property;
    const own = error.constraints
      ? [{ field, constraints: error.constraints }]
      : [];

    return [...own, ...getAllConstraints(error.children ?? [], field)];
  });
}

export function isDuplicateKeyError(error: unknown) {
  return (error as { code?: unknown } | null)?.code === DUPLICATE_KEY_CODE;
}

export function safeStringify(value: unknown) {
  const seen = new WeakSet<object>();

  return JSON.stringify(value, (key, current: unknown) => {
    if (HIDDEN_KEYS.has(key.toLowerCase())) return "[hidden]";
    if (typeof current === "bigint") return current.toString();
    if (typeof current !== "object" || current === null) return current;
    if (seen.has(current)) return "[Circular]";

    seen.add(current);

    return current;
  });
}
