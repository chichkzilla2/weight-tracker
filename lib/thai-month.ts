const THAI_TIME_OFFSET_MS = 7 * 60 * 60 * 1000;

export function getThaiMonthStart(date = new Date()) {
  const thaiDate = new Date(date.getTime() + THAI_TIME_OFFSET_MS);
  return new Date(
    Date.UTC(thaiDate.getUTCFullYear(), thaiDate.getUTCMonth(), 1) -
      THAI_TIME_OFFSET_MS,
  );
}

export function getCurrentThaiMonthRange(now = new Date()) {
  const start = getThaiMonthStart(now);
  const nextThaiMonth = new Date(start.getTime() + THAI_TIME_OFFSET_MS);

  return {
    start,
    end: new Date(
      Date.UTC(
        nextThaiMonth.getUTCFullYear(),
        nextThaiMonth.getUTCMonth() + 1,
        1,
      ) - THAI_TIME_OFFSET_MS,
    ),
  };
}
