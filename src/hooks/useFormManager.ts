/**
 * Reusable Form Management Hook
 * Consolidates form state, validation, and error handling patterns
 * Used across LoginForm, RegisterForm, ProfileForm, and booking forms
 */

import { useState, useCallback } from 'react';

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface UseFormManagerProps<T> {
  initialValues: T;
  validate?: (values: T) => FormErrors;
  onSubmit?: (values: T) => Promise<void> | void;
}

export interface UseFormManagerReturn<T> {
  values: T;
  errors: FormErrors;
  isLoading: boolean;
  isDirty: boolean;
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  clearError: (field: keyof T) => void;
  clearErrors: () => void;
  setErrors: (errors: FormErrors) => void;
  validate: () => boolean;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: () => void;
}

export function useFormManager<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit
}: UseFormManagerProps<T>): UseFormManagerReturn<T> {
  
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Set individual field value with automatic error clearing
  const setValue = useCallback((field: keyof T, value: any) => {
    setValuesState(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Clear field error when user starts typing
    if (errors[field as string]) {
      setErrorsState(prev => ({ ...prev, [field as string]: undefined }));
    }
  }, [errors]);

  // Set multiple values at once
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...newValues }));
    setIsDirty(true);
  }, []);

  // Set error for specific field
  const setError = useCallback((field: keyof T, error: string) => {
    setErrorsState(prev => ({ ...prev, [field as string]: error }));
  }, []);

  // Clear error for specific field
  const clearError = useCallback((field: keyof T) => {
    setErrorsState(prev => ({ ...prev, [field as string]: undefined }));
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrorsState({});
  }, []);

  // Set multiple errors
  const setErrors = useCallback((newErrors: FormErrors) => {
    setErrorsState(newErrors);
  }, []);

  // Validate form using provided validation function
  const validateForm = useCallback((): boolean => {
    if (!validate) return true;
    
    const validationErrors = validate(values);
    setErrorsState(validationErrors);
    
    return Object.keys(validationErrors).length === 0;
  }, [values, validate]);

  // Handle form submission with loading state and error handling
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!validateForm()) return;

    setIsLoading(true);
    clearErrors();

    try {
      if (onSubmit) {
        await onSubmit(values);
      }
    } catch (error) {
      // Let the component handle specific error processing
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [values, validateForm, clearErrors, onSubmit]);

  // Reset form to initial values
  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrorsState({});
    setIsDirty(false);
    setIsLoading(false);
  }, [initialValues]);

  return {
    values,
    errors,
    isLoading,
    isDirty,
    setValue,
    setValues,
    setError,
    clearError,
    clearErrors,
    setErrors,
    validate: validateForm,
    handleSubmit,
    reset
  };
}
