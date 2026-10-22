import { describe, expect, test } from 'vitest';
import { rangeForPreset, formatRangeLabel, daysInRange, monthGrid } from '../dateRanges';
import { deliveryStatus } from '../campaignStatus';
import { consoleId } from '../consoleId';
import { todayKey } from '../liveTick';
import { campaignPath, adGroupPath, CAMPAIGN_TABS, AD_GROUP_TABS } from '../../routes';

// Wednesday 21 Oct 2026
const NOW = new Date(2026, 9, 21, 15, 30);

describe('rangeForPreset', () => {
  test('Last 7 Days ends yesterday and spans 7 days', () => {
    const r = rangeForPreset('last7', NOW);
    expect(formatRangeLabel(r)).toBe('Oct 14 - Oct 20, 2026');
    expect(daysInRange(r)).toBe(7);
  });

  test('This Week starts on Monday', () => {
    expect(rangeForPreset('thisWeek', NOW).from.getDay()).toBe(1);
  });

  test('Last Month covers the whole previous month', () => {
    const r = rangeForPreset('lastMonth', NOW);
    expect(formatRangeLabel(r)).toBe('Sep 1 - Sep 30, 2026');
  });

  test('Year to Date starts on 1 Jan', () => {
    expect(formatRangeLabel(rangeForPreset('ytd', NOW))).toBe('Jan 1 - Oct 21, 2026');
  });

  test('single-day ranges show one date', () => {
    expect(formatRangeLabel(rangeForPreset('yesterday', NOW))).toBe('Oct 20, 2026');
  });
});

describe('monthGrid', () => {
  test('October 2026 starts on a Thursday in a Monday-first grid', () => {
    const grid = monthGrid(2026, 9);
    expect(grid[0].slice(0, 3)).toEqual([null, null, null]);
    expect(grid[0][3].getDate()).toBe(1);
    expect(grid.every(week => week.length === 7)).toBe(true);
  });
});

describe('deliveryStatus', () => {
  const base = { status: 'Enabled', budget: 500, budgetType: 'Daily', startDate: '2026-01-01', endDate: '' };

  test('enabled campaigns are Delivering', () => {
    expect(deliveryStatus(base)).toBe('Delivering');
  });

  test('paused and archived campaigns report their state', () => {
    expect(deliveryStatus({ ...base, status: 'Paused' })).toBe('Paused');
    expect(deliveryStatus({ ...base, status: 'Archived' })).toBe('Archived');
  });

  test('a campaign that has spent its daily budget today is Out of budget', () => {
    expect(deliveryStatus({ ...base, daily: { [todayKey()]: { spend: 500 } } })).toBe('Out of budget');
  });

  test("yesterday's spend does not make a campaign Out of budget", () => {
    expect(deliveryStatus({ ...base, daily: { '2000-01-01': { spend: 9999 } } })).toBe('Delivering');
  });

  test('past end date is Ended', () => {
    expect(deliveryStatus({ ...base, endDate: '2001-01-01' })).toBe('Ended');
  });
});

describe('consoleId', () => {
  test('looks like a console entity ID and is stable', () => {
    expect(consoleId('c1')).toMatch(/^A0[0-9A-Z]{19}$/);
    expect(consoleId('c1')).toBe(consoleId('c1'));
    expect(consoleId('c1')).not.toBe(consoleId('c2'));
  });
});

describe('routes', () => {
  test('mirror the console URL scheme per campaign type', () => {
    expect(campaignPath({ id: 'c1', type: 'Sponsored Products' })).toBe('/cm/sp/campaigns/c1/ad-groups');
    expect(campaignPath({ id: 'c2', type: 'Sponsored Brands' }, 'settings')).toBe('/cm/sb/campaigns/c2/settings');
    expect(adGroupPath({ id: 'c3', type: 'Sponsored Display' }, 'ag1')).toBe('/cm/sd/campaigns/c3/ad-groups/ag1/ads');
  });

  test('tab lists match what the console shows per type', () => {
    expect(CAMPAIGN_TABS.sd.map(t => t.label)).toEqual(['Ad groups', 'Budget rules', 'Campaign settings']);
    expect(CAMPAIGN_TABS.sb.map(t => t.key)).not.toContain('negative-targeting');
    expect(AD_GROUP_TABS.sd.map(t => t.key)).toContain('creative');
    expect(AD_GROUP_TABS.sd.map(t => t.key)).not.toContain('search-terms');
  });
});
