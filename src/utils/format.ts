import { format, formatDistanceToNow, parseISO } from 'date-fns';

// ─── Currency ─────────────────────────────────────────────────────────────────

export function formatKES(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE')}`;
}

export function formatKESCompact(amount: number): string {
  if (amount >= 1_000_000) return `KES ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `KES ${(amount / 1_000).toFixed(1)}K`;
  return `KES ${amount}`;
}

// ─── Price change ─────────────────────────────────────────────────────────────

export function formatPriceChange(pct: number): string {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

export function priceChangeLabel(pct: number): string {
  const abs = Math.abs(pct);
  if (abs >= 10) return pct > 0 ? 'Sharp rise' : 'Sharp drop';
  if (abs >= 5) return pct > 0 ? 'Rising' : 'Falling';
  if (abs >= 1) return pct > 0 ? 'Slight rise' : 'Slight drop';
  return 'Stable';
}

// ─── Dates ────────────────────────────────────────────────────────────────────

export function formatRelativeTime(isoDate: string): string {
  try {
    return formatDistanceToNow(parseISO(isoDate), { addSuffix: true });
  } catch {
    return 'recently';
  }
}

export function formatDate(isoDate: string): string {
  try {
    return format(parseISO(isoDate), 'dd MMM yyyy');
  } catch {
    return isoDate;
  }
}

export function formatShortDate(isoDate: string): string {
  try {
    return format(parseISO(isoDate), 'dd MMM');
  } catch {
    return isoDate;
  }
}

// ─── Percentage bar ───────────────────────────────────────────────────────────

export function pricePercentage(price: number, best: number, worst: number): number {
  if (worst === best) return 100;
  return Math.round(100 - ((price - best) / (worst - best)) * 100);
}

// ─── Initials ─────────────────────────────────────────────────────────────────

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

// ─── Truncate ─────────────────────────────────────────────────────────────────

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
}
