export function validateString(value: string | undefined) {
  if (!value) {
    throw new Error("Value is undefined");
  }
  return value;
}
