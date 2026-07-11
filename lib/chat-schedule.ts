import { CLINIC_TZ_OFFSET } from "./availability";

/**
 * Time options for scheduling a chat consultation. Deliberately separate
 * from lib/availability.ts's slot generator: that one blocks a physical
 * resource (a clinic room) using a service's duration and existing
 * bookings, which doesn't apply to a chat — multiple scheduled chats can
 * coexist, so this just offers fixed 30-min points across her working
 * hours, independent of any service's duration_min (chat services are
 * duration_min: 0, which would break the booking slot generator's math).
 */
const STEP_MIN = 30;

export type ChatSlot = { startsAt: string };

export function generateChatSlots({
  date,
  rules,
  isClosed,
  now = new Date(),
}: {
  date: string; // "YYYY-MM-DD"
  rules: { weekday: number; start_time: string; end_time: string }[];
  isClosed: boolean;
  now?: Date;
}): ChatSlot[] {
  if (isClosed) return [];

  const weekday = new Date(`${date}T00:00:00${CLINIC_TZ_OFFSET}`).getUTCDay();
  const todaysRules = rules.filter((r) => r.weekday === weekday);
  const slots: ChatSlot[] = [];

  for (const rule of todaysRules) {
    let cursor = new Date(`${date}T${rule.start_time}${CLINIC_TZ_OFFSET}`);
    const ruleEnd = new Date(`${date}T${rule.end_time}${CLINIC_TZ_OFFSET}`);

    while (cursor.getTime() < ruleEnd.getTime()) {
      if (cursor.getTime() > now.getTime()) {
        slots.push({ startsAt: cursor.toISOString() });
      }
      cursor = new Date(cursor.getTime() + STEP_MIN * 60_000);
    }
  }

  return slots;
}
