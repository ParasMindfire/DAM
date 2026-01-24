export interface IValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface IValidationResult {
  isValid: boolean;
  errors: IValidationError[];
}
