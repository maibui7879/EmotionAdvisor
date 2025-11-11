import { ScheduleItem } from '../types';

/**
 * Convert time string (HH:MM) to minutes for comparison
 */
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Check if two time ranges overlap
 */
export const isTimeOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  return !(e1 <= s2 || e2 <= s1);
};

/**
 * Find conflicts between new schedule and existing schedules
 */
export const findConflicts = (
  newSchedules: ScheduleItem[],
  existingSchedules: ScheduleItem[]
): { new: ScheduleItem; existing: ScheduleItem }[] => {
  const conflicts: { new: ScheduleItem; existing: ScheduleItem }[] = [];

  newSchedules.forEach(newItem => {
    existingSchedules.forEach(existingItem => {
      if (newItem.date === existingItem.date) {
        if (isTimeOverlap(newItem.startTime, newItem.endTime, existingItem.startTime, existingItem.endTime)) {
          conflicts.push({ new: newItem, existing: existingItem });
        }
      }
    });
  });

  return conflicts;
};

/**
 * Auto-adjust time for conflicting schedules
 * Finds the nearest available time slot after the conflict
 */
export const adjustScheduleTime = (
  schedule: ScheduleItem,
  existingSchedules: ScheduleItem[]
): ScheduleItem => {
  const duration = timeToMinutes(schedule.endTime) - timeToMinutes(schedule.startTime);
  let newStartTime = timeToMinutes(schedule.startTime);
  let newEndTime = newStartTime + duration;

  // Try to find a free slot within 24 hours
  let attempts = 0;
  const maxAttempts = 24 * 60 / Math.max(duration, 30); // Limit attempts

  while (attempts < maxAttempts) {
    let hasConflict = false;

    for (const existing of existingSchedules) {
      if (schedule.date === existing.date) {
        const existingStart = timeToMinutes(existing.startTime);
        const existingEnd = timeToMinutes(existing.endTime);

        // Check if there's overlap
        if (!(newEndTime <= existingStart || newStartTime >= existingEnd)) {
          hasConflict = true;
          // Move to after the existing schedule
          newStartTime = existingEnd;
          newEndTime = newStartTime + duration;
          break;
        }
      }
    }

    if (!hasConflict || newEndTime > 24 * 60) {
      break;
    }
    attempts++;
  }

  // If we can't fit it today, adjust to the next day
  if (newEndTime > 24 * 60) {
    const nextDate = new Date(schedule.date);
    nextDate.setDate(nextDate.getDate() + 1);
    const adjustedSchedule = {
      ...schedule,
      date: nextDate.toISOString().split('T')[0],
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    };
    return adjustedSchedule;
  }

  const hours = Math.floor(newStartTime / 60);
  const minutes = newStartTime % 60;
  const endHours = Math.floor(newEndTime / 60);
  const endMinutes = newEndTime % 60;

  return {
    ...schedule,
    startTime: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
    endTime: `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`,
  };
};

/**
 * Sort schedules by time
 */
export const sortSchedulesByTime = (schedules: ScheduleItem[]): ScheduleItem[] => {
  return [...schedules].sort((a, b) => {
    if (a.date !== b.date) {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  });
};

/**
 * Group schedules by date
 */
export const groupSchedulesByDate = (schedules: ScheduleItem[]): Record<string, ScheduleItem[]> => {
  const grouped: Record<string, ScheduleItem[]> = {};

  schedules.forEach(schedule => {
    if (!grouped[schedule.date]) {
      grouped[schedule.date] = [];
    }
    grouped[schedule.date].push(schedule);
  });

  return Object.fromEntries(
    Object.entries(grouped).sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
  );
};
