import { useMemo } from "react";

export function usePagination<T>(
  data: T[],
  page: number,
  pageSize: number
) {
  const totalItems = data.length;

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = page * pageSize;
    return data.slice(start, end);
  }, [data, page, pageSize]);

  return {
    paginatedData,
    totalItems,
  };
}
