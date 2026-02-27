export function createStudioTimestamp(
  timeOfDay: number,
  referenceDate: Date = new Date(),
): string {
  const date = new Date(referenceDate);
  date.setUTCFullYear(2000, 0, 1);
  const hours = Math.floor(timeOfDay * 24);
  const minutes = Math.floor((timeOfDay * 24 - hours) * 60);
  date.setUTCHours(hours, minutes, 0, 0);
  return date.toISOString();
}
