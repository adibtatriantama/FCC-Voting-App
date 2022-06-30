export type PaginationQueryParams = {
  next?: string;
};

export type PaginationLinks = {
  next?: string;
};

export const createPaginationLinks = (
  path: string,
  paginationQueryParams: PaginationQueryParams,
): PaginationLinks => {
  return {
    next: paginationQueryParams.next
      ? `${process.env.BASE_URL}/${path}?${paginationQueryParams.next}`
      : undefined,
  };
};
