import { todayKey, spendAgainstBudget } from './liveTick';

/** Spend the live simulation has accrued today, used for the "Out of budget" state. */
export const spendToday = (campaign) => campaign.daily?.[todayKey()]?.spend || 0;

/**
 * Delivery status as the console reports it in the Status column.
 * @param {{ status: string, startDate?: string, endDate?: string, budget: number, budgetType?: string }} campaign
 * @returns {'Archived'|'Paused'|'Ended'|'Scheduled'|'Out of budget'|'Delivering'}
 */
export function deliveryStatus(campaign) {
  if (campaign.status === 'Archived') return 'Archived';
  if (campaign.status !== 'Enabled') return 'Paused';
  const t = todayKey();
  if (campaign.endDate && campaign.endDate < t) return 'Ended';
  if (campaign.startDate && campaign.startDate > t) return 'Scheduled';
  if (campaign.budget > 0 && spendAgainstBudget(campaign, t) >= campaign.budget) return 'Out of budget';
  return 'Delivering';
}

export const STATUS_TONE = {
  Delivering: 'is-delivering',
  'Out of budget': 'is-warning',
  Paused: '',
  Archived: '',
  Ended: '',
  Scheduled: '',
};
