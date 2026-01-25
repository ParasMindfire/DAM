import {
  VALIDATION_CONSTANTS,
  MESSAGES_CONSTANTS,
  IValidationError,
  IValidationResult,
} from '@dam/shared';

export class ValidationUtil {
  static validateEmail(email: string): IValidationError | null {
    if (!email) {
      return { field: 'email', message: MESSAGES_CONSTANTS.VALIDATION.REQUIRED_FIELD };
    }
    if (!VALIDATION_CONSTANTS.EMAIL.PATTERN.test(email)) {
      return { field: 'email', message: MESSAGES_CONSTANTS.VALIDATION.EMAIL_INVALID };
    }
    return null;
  }

  static validatePassword(password: string): IValidationError | null {
    if (!password) {
      return { field: 'password', message: MESSAGES_CONSTANTS.VALIDATION.REQUIRED_FIELD };
    }
    if (password.length < VALIDATION_CONSTANTS.PASSWORD.MIN_LENGTH) {
      return { field: 'password', message: MESSAGES_CONSTANTS.VALIDATION.PASSWORD_WEAK };
    }
    return null;
  }

  static validateName(name: string, fieldName: string): IValidationError | null {
    if (!name || name.trim().length === 0) {
      return { field: fieldName, message: MESSAGES_CONSTANTS.VALIDATION.REQUIRED_FIELD };
    }
    if (name.length > VALIDATION_CONSTANTS.NAME.MAX_LENGTH) {
      return {
        field: fieldName,
        message: `Name must not exceed ${VALIDATION_CONSTANTS.NAME.MAX_LENGTH} characters`,
      };
    }
    return null;
  }

  static validateAll(validators: Array<() => IValidationError | null>): IValidationResult {
    const errors: IValidationError[] = [];

    for (const validator of validators) {
      const error = validator();
      if (error) {
        errors.push(error);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
