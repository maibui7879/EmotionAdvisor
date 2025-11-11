// Language translations for the app
export type Language = 'en' | 'vi';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // App title
    'app.title': 'Aura',
    'app.subtitle': 'Your Mental Wellness Companion',

    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.chat': 'AI Assistant',
    'nav.schedule': 'Schedule',
    'nav.history': 'History',
    'nav.notifications': 'Notifications',
    'nav.profile': 'Profile',

    // Login
    'login.title': 'SybauSuzuka',
    'login.subtitle': 'Your Mental Wellness Companion',
    'login.placeholder': 'Enter your name',
    'login.button': 'Start Journey',
    'login.welcome': 'Welcome back, {name}! How are you feeling today?',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Track your emotional wellness journey',
    'dashboard.summary': 'AI Wellness Summary',
    'dashboard.reload': 'Reload',
    'dashboard.lastUpdated': 'Last updated: {time}',
    'dashboard.chart': 'Emotion Journey',

    // Chat
    'chat.title': 'Chat with AI',
    'chat.placeholder': 'Share how you\'re feeling...',
    'chat.send': 'Send',
    'chat.typing': 'AI is thinking...',
    'chat.newChat': 'New Chat',
    'chat.clearHistory': 'Clear History',

    // Emotion Logger
    'emotion.title': 'Log Your Emotion',
    'emotion.mood': 'Mood',
    'emotion.intensity': 'Intensity',
    'emotion.note': 'Note',
    'emotion.camera': 'Camera',
    'emotion.analyze': 'Analyze',
    'emotion.success': 'Emotion logged successfully!',

    // Schedule
    'schedule.title': 'Schedule Timetable',
    'schedule.subtitle': 'View and manage your daily wellness schedule',
    'schedule.today': 'Today',
    'schedule.previous': 'Previous',
    'schedule.next': 'Next',
    'schedule.noActivities': 'No activities',
    'schedule.noSchedules': 'No schedules for this day',
    'schedule.toggleComplete': 'Toggle complete',
    'schedule.delete': 'Delete',
    'schedule.completed': 'Completed "{title}"!',
    'schedule.uncompleted': 'Unmarked "{title}"',
    'schedule.deleted': 'Schedule item deleted',

    // History
    'history.title': 'Emotion History',
    'history.subtitle': 'Your conversation journey',
    'history.noHistory': 'No history yet',
    'history.empty': 'Start chatting to see your conversation history here',
    'history.mood': 'Mood detected',

    // Notifications
    'notifications.title': 'Notifications',
    'notifications.subtitle': 'Your reminders and updates',
    'notifications.empty': 'No notifications',
    'notifications.clearAll': 'Clear All',
    'notifications.markRead': 'Mark as read',

    // Profile
    'profile.title': 'Profile',
    'profile.subtitle': 'Manage your account and preferences',
    'profile.name': 'Name',
    'profile.email': 'Email',
    'profile.createdAt': 'Member since',
    'profile.settings': 'Settings',
    'profile.language': 'Language',
    'profile.theme': 'Theme',
    'profile.light': 'Light',
    'profile.dark': 'Dark',
    'profile.color': 'Color Theme',
    'profile.logout': 'Logout',
    'profile.confirmLogout': 'Are you sure you want to logout?',

    // Suggestions
    'suggestion.suggestedActivities': 'Suggested Activities',
    'suggestion.accept': 'Accept',
    'suggestion.reject': 'Reject',
    'suggestion.hint': '💡 Click the checkmark to add to your schedule, or X to dismiss.',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.info': 'Info',
    'common.warning': 'Warning',
  },

  vi: {
    // App title
    'app.title': 'Aura',
    'app.subtitle': 'Người bạn đồng hành sức khỏe tâm thần',

    // Navigation
    'nav.dashboard': 'Trang chủ',
    'nav.chat': 'Chuyên viên tâm lí AI',
    'nav.schedule': 'Lịch trình',
    'nav.history': 'Lịch sử',
    'nav.notifications': 'Thông báo',
    'nav.profile': 'Hồ sơ',

    // Login
    'login.title': 'SybauSuzuka',
    'login.subtitle': 'Người bạn đồng hành sức khỏe tinh thần',
    'login.placeholder': 'Nhập tên của bạn',
    'login.button': 'Bắt đầu hành trình',
    'login.welcome': 'Chào mừng trở lại, {name}! Hôm nay bạn cảm thấy thế nào?',

    // Dashboard
    'dashboard.title': 'Bảng điều khiển',
    'dashboard.subtitle': 'Theo dõi sức khỏe tâm lí của bạn',
    'dashboard.summary': 'Tóm tắt tình trạng sức khỏe tâm lí từ SybauSuzuka',
    'dashboard.reload': 'Làm mới',
    'dashboard.lastUpdated': 'Cập nhật lần cuối: {time}',
    'dashboard.chart': 'Biểu đồ cảm xúc',

    // Chat
    'chat.title': 'Chat với AI',
    'chat.placeholder': 'Chia sẻ cảm giác của bạn...',
    'chat.send': 'Gửi',
    'chat.typing': 'AI đang suy nghĩ...',
    'chat.newChat': 'Đoạn chat mới',
    'chat.clearHistory': 'Xóa lịch sử',

    // Emotion Logger
    'emotion.title': 'Ghi lại cảm xúc',
    'emotion.mood': 'Tâm trạng',
    'emotion.intensity': 'Độ mạnh',
    'emotion.note': 'Ghi chú',
    'emotion.camera': 'Camera',
    'emotion.analyze': 'Phân tích',
    'emotion.success': 'Ghi lại cảm xúc thành công!',

    // Schedule
    'schedule.title': 'Lịch trình gợi ý',
    'schedule.subtitle': 'Xem và quản lý lịch trình wellness hàng ngày',
    'schedule.today': 'Hôm nay',
    'schedule.previous': 'Trước đó',
    'schedule.next': 'Tiếp theo',
    'schedule.noActivities': 'Không có hoạt động',
    'schedule.noSchedules': 'Không có lịch cho ngày này',
    'schedule.toggleComplete': 'Đánh dấu hoàn thành',
    'schedule.delete': 'Xóa',
    'schedule.completed': 'Đã hoàn thành "{title}"!',
    'schedule.uncompleted': 'Bỏ đánh dấu "{title}"',
    'schedule.deleted': 'Đã xóa lịch',

    // History
    'history.title': 'Lịch sử cảm xúc',
    'history.subtitle': 'Lịch sử trò chuyện của bạn',
    'history.noHistory': 'Chưa có lịch sử',
    'history.empty': 'Bắt đầu trò chuyện để xem lịch sử đoạn chat của bạn',
    'history.mood': 'Tâm trạng được phát hiện',

    // Notifications
    'notifications.title': 'Thông báo',
    'notifications.subtitle': 'Nhắc nhở và cập nhật của bạn',
    'notifications.empty': 'Không có thông báo',
    'notifications.clearAll': 'Xóa tất cả',
    'notifications.markRead': 'Đánh dấu đã đọc',

    // Profile
    'profile.title': 'Hồ sơ',
    'profile.subtitle': 'Quản lý tài khoản và tùy chọn của bạn',
    'profile.name': 'Tên',
    'profile.email': 'Email',
    'profile.createdAt': 'Thành viên từ',
    'profile.settings': 'Cài đặt',
    'profile.language': 'Ngôn ngữ',
    'profile.theme': 'Giao diện',
    'profile.light': 'Sáng',
    'profile.dark': 'Tối',
    'profile.color': 'Chủ đề màu',
    'profile.logout': 'Đăng xuất',
    'profile.confirmLogout': 'Bạn có chắc muốn đăng xuất?',

    // Suggestions
    'suggestion.suggestedActivities': 'Hoạt động được đề xuất',
    'suggestion.accept': 'Chấp nhận',
    'suggestion.reject': 'Từ chối',
    'suggestion.hint': '💡 Bấm dấu kiểm để thêm vào lịch trình, hoặc X để bỏ.',

    // Common
    'common.loading': 'Đang tải...',
    'common.error': 'Lỗi',
    'common.success': 'Thành công',
    'common.info': 'Thông tin',
    'common.warning': 'Cảnh báo',
  },
};

export const t = (key: string, language: Language, replacements?: Record<string, string>): string => {
  let text = translations[language][key] || translations.en[key] || key;

  if (replacements) {
    Object.entries(replacements).forEach(([placeholder, value]) => {
      text = text.replace(`{${placeholder}}`, value);
    });
  }

  return text;
};
