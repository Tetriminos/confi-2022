export class UnableToSendEmailException extends Error {
  constructor() {
    super('Unable to send email');
  }
}
