import { useQuery } from "@tanstack/react-query";
import authApi from "../../api/authApi";

/**
 * Hook to fetch product-group names under a category.
 * @param {number|string} categoryId - ID of the category.
 * @param {number} page - Page index (default 0).
 * @param {number} limit - Page size (default 30).
 * @param {string} sortBy - Field to sort by (default 'createdAt').
 * @param {string} sortDir - Sort direction 'asc'|'desc' (default 'desc').
 */
const useProductGroupsByCategoryId = (
  categoryId,
  page = 0,
  limit = 30,
  sortBy = "createdAt",
  sortDir = "desc"
) => {
  return useQuery({
    queryKey: ["productGroupsByCategory", categoryId, page, limit, sortBy, sortDir],
    queryFn: () =>
      authApi
        .getProductGroupsByCategoryId(categoryId, page, limit, sortBy, sortDir)
        .then((res) => res.data.content ?? res.data),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
};

export default useProductGroupsByCategoryId; 