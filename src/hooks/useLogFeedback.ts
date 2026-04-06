import { useCallback, useState } from 'react';

export function useLogFeedback() {
  const [message, setMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [error, setError] = useState('');

  const showSuccess = useCallback((nextMessage: string) => {
    setError('');
    setMessage(nextMessage);
    setToastVisible(true);
  }, []);

  const showError = useCallback((nextError: string) => {
    setMessage('');
    setError(nextError);
  }, []);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  const dismissToast = useCallback(() => {
    setToastVisible(false);
  }, []);

  return {
    message,
    toastVisible,
    error,
    showSuccess,
    showError,
    clearError,
    dismissToast,
  };
}
