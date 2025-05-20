import { useQuery } from "@tanstack/react-query";
import authApi from "../../api/authApi";

/**
 * Hook to fetch products under a category.
 * @param {number|string} categoryId - ID of the category.
 */
const useProductsByCategoryId = (categoryId) => {
  return useQuery({
    queryKey: ["productsByCategory", categoryId],
    queryFn: () =>
      authApi
        .getProductsByCategoryId(categoryId)
        .then((res) => res.data.content ?? res.data),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
};

export default useProductsByCategoryId; 