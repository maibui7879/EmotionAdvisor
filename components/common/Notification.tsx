
import React from 'react';
import { Info, CheckCircle, XCircle } from 'lucide-react';

interface NotificationProps {
  message: string;
  type: 'info' | 'success' | 'error';
}

const Notification: React.FC<NotificationProps> = ({ message, type }) => {
  const styles = {
    info: {
      bg: 'bg-blue-100 dark:bg-blue-900',
      text: 'text-blue-800 dark:text-blue-200',
      icon: <Info className="text-blue-500" />
    },
    success: {
      bg: 'bg-green-100 dark:bg-green-900',
      text: 'text-green-800 dark:text-green-200',
      icon: <CheckCircle className="text-green-500" />
    },
    error: {
      bg: 'bg-red-100 dark:bg-red-900',
      text: 'text-red-800 dark:text-red-200',
      icon: <XCircle className="text-red-500" />
    },
  };

  const currentStyle = styles[type];

  return (
    <div className={`flex items-center p-4 rounded-lg shadow-lg ${currentStyle.bg} animate-fade-in-right`}>
      <div className="flex-shrink-0">
        {currentStyle.icon}
      </div>
      <div className={`ml-3 text-sm font-medium ${currentStyle.text}`}>
        {message}
      </div>
    </div>
  );
};

export default Notification;
