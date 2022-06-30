import { PaginationQueryParams } from './pagination';

export type Items<Type> = {
  items: Type[];
  paginationQueryParams: PaginationQueryParams;
};
