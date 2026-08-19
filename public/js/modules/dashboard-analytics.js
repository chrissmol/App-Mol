const DAY = 86400000;

export function safeJSON(value, fallback = null) {
  try { return JSON.parse(value); } catch { return fallback; }
}

export function dateOf(value) {
  const source = value?.concluidoEm ?? value;
  if (source?.toDate) return source.toDate();
  if (Number.isFinite(Number(source?.seconds))) return new Date(Number(source.seconds) * 1000);
  if (source instanceof Date) return Number.isNaN(source.getTime()) ? null : source;
  if (typeof source === 'string' || typeof source === 'number') {
    const date = new Date(source);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

export function monday(value = new Date()) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date;
}

export function sessionsInWeek(sessions, reference = new Date()) {
  const start = monday(reference);
  const end = new Date(start.getTime() + 7 * DAY);
  return sessions.filter(session => {
    const date = dateOf(session);
    return date && date >= start && date < end;
  });
}

export function weeklyStreak(sessions, reference = new Date()) {
  const starts = new Set(sessions.map(dateOf).filter(Boolean).map(date => monday(date).getTime()));
  let cursor = monday(reference);
  if (!starts.has(cursor.getTime())) cursor = new Date(cursor.getTime() - 7 * DAY);
  let streak = 0;
  while (starts.has(cursor.getTime())) {
    streak += 1;
    cursor = new Date(cursor.getTime() - 7 * DAY);
  }
  return streak;
}
