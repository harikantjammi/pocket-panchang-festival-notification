const IST_TIME_ZONE = 'Asia/Kolkata';

export function getCurrentISTDateComponents(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: IST_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const values = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value])
  );

  return {
    day: parseInt(values.day, 10),
    month: parseInt(values.month, 10),
    year: parseInt(values.year, 10),
  };
}
