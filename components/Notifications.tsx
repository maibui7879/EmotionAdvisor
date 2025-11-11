import React, { useState, useEffect } from 'react';
import { Notification as NotificationType } from '../types';
import { Trash2, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Language, t } from '../i18n';

interface NotificationsProps {
  notifications: NotificationType[];
  onClear: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ notifications, onClear }) => {
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationType[]>([]);
  const [filter, setFilter] = useState<'all' | 'success' | 'error' | 'info'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const language: Language = (localStorage.getItem('language') as Language) || 'en';

  useEffect(() => {
    let filtered = notifications;

    if (filter !== 'all') {
      filtered = filtered.filter(n => n.type === filter);
    }

    if (sortOrder === 'newest') {
      filtered = filtered.sort((a, b) => b.id - a.id);
    } else {
      filtered = filtered.sort((a, b) => a.id - b.id);
    }

    setFilteredNotifications(filtered);
  }, [notifications, filter, sortOrder]);

  const getIcon = (type: NotificationType['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-500" size={24} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={24} />;
      case 'info':
      default:
        return <Info className="text-blue-500" size={24} />;
    }
  };

  const getTypeStyles = (type: NotificationType['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500';
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          {t('notifications.title', language)}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {filteredNotifications.length} {filteredNotifications.length === 1 ? (language === 'vi' ? 'thông báo' : 'notification') : (language === 'vi' ? 'thông báo' : 'notifications')}
        </p>
      </div>

      {/* Filter and Sort Controls */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {language === 'vi' ? 'Lọc theo loại' : 'Filter by Type'}
            </label>
            <div className="flex flex-wrap gap-2">
              {(['all', 'success', 'error', 'info'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === type
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {language === 'vi' ? 'Sắp xếp' : 'Sort Order'}
            </label>
            <div className="flex gap-2">
              {(['newest', 'oldest'] as const).map(order => (
                <button
                  key={order}
                  onClick={() => setSortOrder(order)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    sortOrder === order
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {order.charAt(0).toUpperCase() + order.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredNotifications.length > 0 && (
            <button
            onClick={onClear}
            className="w-full flex items-center justify-center px-4 py-2 font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
          >
            <Trash2 size={18} className="mr-2" />
            {t('notifications.clearAll', language)}
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg shadow-md transition-all hover:shadow-lg ${getTypeStyles(notification.type)}`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 dark:text-gray-200 break-words">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {new Date(notification.id).toLocaleString((language === 'vi' ? 'vi-VN' : 'en-US'))}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Info size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {t('notifications.empty', language)}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              {language === 'vi' ? 'Thông báo của bạn sẽ xuất hiện ở đây' : 'Your notifications will appear here'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
