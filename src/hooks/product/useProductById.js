import { useQuery } from "@tanstack/react-query";
import authApi from "../../api/authApi";

/**
 * Hook to fetch product details by ID.
 * @param {number|string} productId - ID of the product to fetch.
 */
const useProductById = (productId) => {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: () => authApi.getProductsById(productId).then(res => res.data),
    enabled: !!productId,
    staleTime: 1000 * 60 * 10, // cache for 10 minutes
    retry: 1,
  });
};

export default useProductById; 