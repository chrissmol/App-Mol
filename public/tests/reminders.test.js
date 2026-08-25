import { afterEach, describe, expect, it, vi } from 'vitest';
import { normalizeReminderPreferences, sendTestReminder } from '../js/utils/reminders.js';

afterEach(() => vi.unstubAllGlobals());

describe('preferências de lembretes', () => {
  it('aceita somente booleano explícito e horários válidos', () => {
    expect(normalizeReminderPreferences({ enabled: true, workoutTime: '06:05', mealTime: '23:59' })).toEqual({ enabled: true, workoutTime: '06:05', mealTime: '23:59' });
    expect(normalizeReminderPreferences({ enabled: 'true', workoutTime: '25:00', mealTime: '9:30' })).toEqual({ enabled: false, workoutTime: '18:00', mealTime: '12:00' });
  });

  it('só confirma o teste depois que o service worker exibe a notificação', async () => {
    const showNotification = vi.fn().mockResolvedValue(undefined);
    const NotificationMock = function NotificationMock() {};
    NotificationMock.permission = 'granted';
    vi.stubGlobal('Notification', NotificationMock);
    vi.stubGlobal('window', { Notification: NotificationMock });
    vi.stubGlobal('navigator', { serviceWorker: { getRegistration: vi.fn().mockResolvedValue({ showNotification }) } });
    await sendTestReminder();
    expect(showNotification).toHaveBeenCalledWith('Mol', expect.objectContaining({ body: expect.stringContaining('Lembretes ativados') }));
  });

  it('propaga a falha real de entrega da notificação de teste', async () => {
    const NotificationMock = function NotificationMock() {};
    NotificationMock.permission = 'granted';
    vi.stubGlobal('Notification', NotificationMock);
    vi.stubGlobal('window', { Notification: NotificationMock });
    vi.stubGlobal('navigator', { serviceWorker: { getRegistration: vi.fn().mockResolvedValue({ showNotification: vi.fn().mockRejectedValue(new Error('falhou')) }) } });
    await expect(sendTestReminder()).rejects.toThrow('falhou');
  });
});
