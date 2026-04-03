import { PostgrestError } from '@supabase/supabase-js';
import { withRetry, isTimeoutError, isNetworkError } from './retryHelper';

export interface SupabaseResponse<T> {
  data: T | null;
  error: PostgrestError | Error | null;
}

export async function executeQuery<T>(
  queryFn: () => Promise<SupabaseResponse<T>>,
  options?: {
    retryOnTimeout?: boolean;
    maxRetries?: number;
  }
): Promise<SupabaseResponse<T>> {
  const { retryOnTimeout = true, maxRetries = 3 } = options || {};

  try {
    if (retryOnTimeout) {
      return await withRetry(queryFn, {
        maxRetries,
        shouldRetry: (error) => {
          return isTimeoutError(error) || isNetworkError(error);
        },
      });
    }
    return await queryFn();
  } catch (error) {
    if (isTimeoutError(error)) {
      return {
        data: null,
        error: new Error(
          'Request timeout. Please check your connection and try again.'
        ),
      };
    }

    if (isNetworkError(error)) {
      return {
        data: null,
        error: new Error(
          'Network error. Please check your connection and try again.'
        ),
      };
    }

    return {
      data: null,
      error: error instanceof Error ? error : new Error('An unexpected error occurred'),
    };
  }
}

export function handleSupabaseError(error: PostgrestError | Error | null): string {
  if (!error) return '';

  if (isTimeoutError(error)) {
    return 'Request timeout. Please try again.';
  }

  if (isNetworkError(error)) {
    return 'Network error. Please check your connection.';
  }

  if ('code' in error && error.code) {
    switch (error.code) {
      case 'PGRST301':
        return 'Resource not found';
      case '23505':
        return 'This record already exists';
      case '23503':
        return 'Related record not found';
      case '42501':
        return 'Permission denied';
      default:
        return error.message || 'An error occurred';
    }
  }

  return error.message || 'An unexpected error occurred';
}
