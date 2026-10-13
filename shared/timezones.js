export function zonedParts(date, timezone) {
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(date))
      .filter((p) => p.type !== "literal")
      .map((p) => [p.type, Number(p.value)]),
  );
}
export function wallTimeToUTC(p, timezone) {
  const target = Date.UTC(
    p.year,
    p.month - 1,
    p.day,
    p.hour,
    p.minute,
    p.second || 0,
  );
  let guess = target;
  for (let i = 0; i < 4; i++) {
    const actual = zonedParts(guess, timezone);
    const offset =
      Date.UTC(
        actual.year,
        actual.month - 1,
        actual.day,
        actual.hour,
        actual.minute,
        actual.second,
      ) - guess;
    guess = target - offset;
  }
  const check = zonedParts(guess, timezone);
  if (["year", "month", "day", "hour", "minute"].some((k) => check[k] !== p[k]))
    throw new Error("A series time falls in a daylight-saving clock change. Choose another time.");
  return new Date(guess).toISOString();
}
