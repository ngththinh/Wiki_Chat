import { VALIDATION, MESSAGES } from "@/constants";

export interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
  general?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

// Email validation
export const validateEmail = (email: string): string => {
  if (!email) {
    return MESSAGES.ERROR.EMAIL_REQUIRED;
  }
  if (!VALIDATION.EMAIL_REGEX.test(email)) {
    return MESSAGES.ERROR.EMAIL_INVALID;
  }
  return "";
};

// Password validation
export const validatePassword = (password: string): string => {
  if (!password) {
    return MESSAGES.ERROR.PASSWORD_REQUIRED;
  }
  if (password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
    return MESSAGES.ERROR.PASSWORD_MIN_LENGTH;
  }
  return "";
};

// Confirm password validation
export const validateConfirmPassword = (
  password: string,
  confirmPassword: string,
): string => {
  if (!confirmPassword) {
    return MESSAGES.ERROR.PASSWORD_CONFIRM_REQUIRED;
  }
  if (password !== confirmPassword) {
    return MESSAGES.ERROR.PASSWORD_NOT_MATCH;
  }
  return "";
};

// Terms validation
export const validateTerms = (acceptTerms: boolean): string => {
  if (!acceptTerms) {
    return MESSAGES.ERROR.TERMS_REQUIRED;
  }
  return "";
};

// Validate login form
export const validateLoginForm = (formData: LoginFormData): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validatePassword(formData.password);
  if (passwordError) errors.password = passwordError;
  
  return errors;
};

// Validate register form
export const validateRegisterForm = (formData: RegisterFormData): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validatePassword(formData.password);
  if (passwordError) errors.password = passwordError;
  
  const confirmPasswordError = validateConfirmPassword(
    formData.password,
    formData.confirmPassword,
  );
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
  
  const termsError = validateTerms(formData.acceptTerms);
  if (termsError) errors.terms = termsError;
  
  return errors;
};
