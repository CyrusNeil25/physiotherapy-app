/** Clinic timezone. India has no DST, so a fixed offset is sufficient. */
export const CLINIC_TZ_OFFSET = "+05:30";

export type Slot = { startsAt: string; endsAt: string; available: boolean };

type Rule = { weekday: number; start_time: string; end_time: string };
type Range = { starts_at: string; ends_at: string };

/**
 * Pure slot generator: weekly rules minus a day exception minus existing
 * bookings minus the past. The DB exclusion constraint is still the source
 * of truth for correctness under concurrency — this only decides what to
 * *offer*, not what's ultimately allowed.
 */
export function generateSlots({
  date,
  durationMin,
  rules,
  isClosed,
  bookedRanges,
  now = new Date(),
}: {
  date: string; // "YYYY-MM-DD"
  durationMin: number;
  rules: Rule[];
  isClosed: boolean;
  bookedRanges: Range[];
  now?: Date;
}): Slot[] {
  if (isClosed) return [];

  const weekday = new Date(`${date}T00:00:00${CLINIC_TZ_OFFSET}`).getUTCDay();
  const todaysRules = rules.filter((r) => r.weekday === weekday);
  if (todaysRules.length === 0) return [];

  const durationMs = durationMin * 60_000;
  const slots: Slot[] = [];

  for (const rule of todaysRules) {
    let cursor = new Date(`${date}T${rule.start_time}${CLINIC_TZ_OFFSET}`);
    const ruleEnd = new Date(`${date}T${rule.end_time}${CLINIC_TZ_OFFSET}`);

    while (cursor.getTime() + durationMs <= ruleEnd.getTime()) {
      const slotEnd = new Date(cursor.getTime() + durationMs);
      const overlapsBooking = bookedRanges.some(
        (b) =>
          cursor.getTime() < new Date(b.ends_at).getTime() &&
          slotEnd.getTime() > new Date(b.starts_at).getTime()
      );
      const isPast = cursor.getTime() < now.getTime();

      slots.push({
        startsAt: cursor.toISOString(),
        endsAt: slotEnd.toISOString(),
        available: !overlapsBooking && !isPast,
      });
      cursor = slotEnd;
    }
  }

  return slots;
}
