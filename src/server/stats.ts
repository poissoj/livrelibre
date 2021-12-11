import { getDb } from "@/server/database";

export const getStats = async (): Promise<{
  hours: Record<number, number>;
  days: Record<number, number>;
}> => {
  const db = await getDb();
  const sales = await db
    .collection("sales")
    .find({ deleted: { $exists: false } }, { projection: { _id: 1 } })
    .toArray();
  const hours: Record<number, number> = {};
  const days: Record<number, number> = {};
  for (const sale of sales) {
    const timestamp = sale._id.getTimestamp();
    const hour = timestamp.getHours();
    const day = timestamp.getDay();
    hours[hour] = (hours[hour] || 0) + 1;
    days[day] = (days[day] || 0) + 1;
  }
  return { hours, days };
};
