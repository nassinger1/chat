import type { PaginatedResult } from "./interfaces/paginated-result.interface.js";

export type PageOptions = {
  page: number;
  limit: number;
};

export function toPaginatedResult<Item>(
  items: Item[],
  itemCount: number,
  { page, limit }: PageOptions,
): PaginatedResult<Item> {
  const pageCount = Math.ceil(itemCount / limit);

  return {
    items,
    meta: {
      page,
      limit,
      itemCount,
      pageCount,
      hasPreviousPage: page > 1,
      hasNextPage: page < pageCount,
    },
  };
}
