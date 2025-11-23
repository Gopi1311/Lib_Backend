export function getPagination(query: any, defaultSort = "-createdAt") {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 20, 1);
  const skip = (page - 1) * limit;
  const sort = query.sort?.toString() ?? defaultSort;

  return { page, limit, skip, sort };
}
