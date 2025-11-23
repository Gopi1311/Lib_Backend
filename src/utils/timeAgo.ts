const timeAgo = (date: Date): string => {
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;

  const units: Record<string, number> = {
    year: 365 * 24 * 3600,
    month: 30 * 24 * 3600,
    week: 7 * 24 * 3600,
    day: 24 * 3600,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  for (const [unit, sec] of Object.entries(units)) {
    const value = Math.floor(diff / sec);
    if (value >= 1) return `${value} ${unit}${value > 1 ? "s" : ""} ago`;
  }
  return "just now";
};

export default timeAgo;
