/**
 * Tests for Evidence Types
 */

import { ValidationError } from './types';

describe('ValidationError', () => {
  it('should create ValidationError with message and errors', () => {
    const errors = ['Error 1', 'Error 2'];
    const error = new ValidationError('Validation failed', errors);

    expect(error.message).toBe('Validation failed');
    expect(error.name).toBe('ValidationError');
    expect(error.errors).toEqual(errors);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ValidationError);
  });

  it('should handle empty errors array', () => {
    const error = new ValidationError('Test error', []);

    expect(error.errors).toEqual([]);
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('ValidationError');
  });

  it('should handle multiple errors', () => {
    const errors = [
      'Missing required field: exploitation',
      'Invalid value for automatable',
      'Technical impact cannot be null'
    ];
    const error = new ValidationError('Multiple validation issues', errors);

    expect(error.errors).toHaveLength(3);
    expect(error.errors[0]).toBe('Missing required field: exploitation');
    expect(error.errors[2]).toBe('Technical impact cannot be null');
  });
});