import { useEffect, useState } from 'react';
import SuccessToast from './SuccessToast';
import { SHOW_SUCCESS_NOTIFICATION_EVENT } from '../hooks/useSaveEventHandler';

export default function GlobalSaveNotification() {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const listener = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string }>;
      setMessage(customEvent.detail.message);
      setVisible(true);
    };

    window.addEventListener(SHOW_SUCCESS_NOTIFICATION_EVENT, listener);

    return () => {
      window.removeEventListener(SHOW_SUCCESS_NOTIFICATION_EVENT, listener);
    };
  }, []);

  return (
    <SuccessToast
      message={message}
      visible={visible}
      onDismiss={() => setVisible(false)}
      duration={3000}
    />
  );
}
