export function daysSince(dateString: string): number {
  return Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
}

export function saleDeadlineProgress(activatedAt: string, deadlineMonths: number) {
  const start = new Date(activatedAt);
  const deadline = new Date(start);
  deadline.setMonth(deadline.getMonth() + deadlineMonths);

  const now = new Date();
  const dayMs = 1000 * 60 * 60 * 24;
  const totalDays = Math.round((deadline.getTime() - start.getTime()) / dayMs);
  const elapsedDays = Math.max(0, Math.round((now.getTime() - start.getTime()) / dayMs));
  const remainingDays = Math.round((deadline.getTime() - now.getTime()) / dayMs);
  const pct = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));

  return { pct, remainingDays };
}
