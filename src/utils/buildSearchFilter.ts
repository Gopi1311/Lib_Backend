export function buildSearchFilter(
  query: Record<string, unknown>,
  fields: readonly string[]
) {
  return Object.fromEntries(
    Object.entries(query)
      .filter(([key, value]) => fields.includes(key) && value)
      .map(([key, value]) => [
        key,
        { $regex: String(value), $options: "i" },
      ])
  );
}
