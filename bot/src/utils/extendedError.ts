/**
 * Custom error class that allows attaching structured context data.
 */
export class ExtendedError extends Error {
  public readonly context?: Record<string, any>;

  /**
   * Creates an instance of ExtendedError.
   * @param message - The error message.
   * @param context - Optional structured data related to the error.
   */
  constructor(message: string, context?: Record<string, any>) {
    // Call the base Error constructor
    super(message);

    // Set the prototype explicitly (required for extending built-in classes like Error)
    Object.setPrototypeOf(this, ExtendedError.prototype);

    // Set the error name
    this.name = this.constructor.name; // Or you could hardcode 'ExtendedError'

    // Attach the context
    this.context = context || {};

    // Capture the stack trace (excluding the constructor call)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Helper method to convert the error to a plain object,
   * useful for logging or serialization.
   */
  toObject() {
    return {
      name: this.name,
      message: this.message,
      stack: this.stack,
      context: this.context,
    };
  }
}
