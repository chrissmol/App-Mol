// Resumo semanal do Início: últimos 7 dias com dados reais (treinos, volume, refeições, peso).
import { dateOf } from './dashboard-analytics.js';

const DAY = 86400000;

/** Aparece no domingo e na segunda (fecha uma semana, abre a outra) para quem já treinou alguma vez. */
export const showWeeklyReview = (sessions, now = new Date()) => [0, 1].includes(now.getDay()) && (sessions || []).length > 0;

/**
 * @param {{ sessions?: any[], weights?: any[], mealDays?: number | null, goal?: number, now?: Date }} input
 * mealDays: dias com refeição no diário (null quando a dieta está desligada).
 */
export function weeklyReview({ sessions = [], weights = [], mealDays = null, goal = 3, now = new Date() } = {}) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - 6 * DAY;
  const inWeek = date => date && date.getTime() >= start && date.getTime() <= now.getTime();
  const week = sessions.filter(session => inWeek(dateOf(session)));
  const volume = Math.round(week.reduce((sum, session) => sum + (Number(session.volumeTotal) || 0), 0));
  const weekWeights = weights
    .map(item => ({ kg: Number(item.pesoKg), date: dateOf(item.registradoEm) }))
    .filter(item => item.kg > 0 && inWeek(item.date))
    .sort((a, b) => a.date - b.date);
  const weightChange = weekWeights.length >= 2 ? Math.round((weekWeights.at(-1).kg - weekWeights[0].kg) * 10) / 10 : null;
  const target = Math.max(1, Number(goal) || 1);
  const state = week.length >= target ? 'conquista' : week.length > 0 ? 'evolucao' : 'apoio';
  return { workouts: week.length, goal: target, volume, mealDays, weightChange, state };
}
