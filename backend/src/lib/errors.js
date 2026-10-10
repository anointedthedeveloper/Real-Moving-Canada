/** An error with an HTTP status whose message is safe to show to the visitor. */
export class HttpError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    this.fields = fields;
    this.expose = true;
  }
}

export const badRequest = (message, fields) => new HttpError(400, message, fields);
export const unauthorized = (message = 'Please sign in to continue.') => new HttpError(401, message);
export const forbidden = (message = 'You don’t have access to this.') => new HttpError(403, message);
export const notFound = (message = 'Not found.') => new HttpError(404, message);
export const conflict = (message, fields) => new HttpError(409, message, fields);
export const tooMany = (message = 'Too many attempts. Please wait a few minutes and try again.') => new HttpError(429, message);
export const unavailable = (message) => new HttpError(503, message);
