import React from 'react';
import Notification from './Notification';
import { Notification as NotificationType } from '../../types';
import { X } from 'lucide-react';

interface NotificationContainerProps {
  notifications: NotificationType[];
  onRemove?: (id: number) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className="animate-fade-in-right relative group"
        >
          <div className="flex items-center gap-2">
            <Notification message={notification.message} type={notification.type} />
            {onRemove && (
              <button
                onClick={() => onRemove(notification.id)}
                className="flex-shrink-0 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Close notification"
              >
                <X size={18} className="text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
