import { useQuery } from "@tanstack/react-query";
import authApi from "../../api/authApi";

/**
 * Hook to search products with optional query parameters.
 * @param {object} queryParams - Parameters as defined in Swagger: keyword, category, group, minPrice, maxPrice, rental, page, limit, sortBy, sortDir.
 */
const useSearchProducts = (queryParams = {}) => {
  return useQuery({
    queryKey: ["searchProducts", queryParams],
    queryFn: () =>
      authApi
        .searchProducts(queryParams)
        .then((res) => res.data.content ?? res.data),
    // always enabled since params are optional
    keepPreviousData: true,
    staleTime: 1000 * 60 * 10, // cache for 10 minutes
    retry: 1,
  });
};

export default useSearchProducts;
