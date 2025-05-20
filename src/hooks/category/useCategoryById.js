import { useQuery } from "@tanstack/react-query";
import authApi from "../../api/authApi";

/**
 * Hook to fetch category details by ID.
 * @param {number|string} categoryId - ID of the category to fetch.
 */
const useCategoryById = (categoryId) => {
  return useQuery({
    queryKey: ["category", categoryId],
    queryFn: () => authApi.getCategoryById(categoryId).then(res => res.data),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 10, // cache for 10 minutes
    retry: 1,
  });
};

export default useCategoryById; 