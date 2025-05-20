import { useQuery } from "@tanstack/react-query";
import authApi from "../../api/authApi";

/**
 * Helper to fetch detailed information of an order by its ID
 */
export const fetchOrderDetailsById = async (id) => {
  if (!id) return null;
  const response = await authApi.getOrderDetailsById(id);
  return response.data;
};

/**
 * Hook to fetch detailed information of an order by its ID
 * @param {string|number} id - The ID of the order
 */
const useOrderDetailsById = (id) => {
  return useQuery({
    queryKey: ["orderDetailsById", id],
    queryFn: () => fetchOrderDetailsById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,    // 5 minutes
    cacheTime: 1000 * 60 * 30,   // 30 minutes
    retry: 1,
  });
};

export default useOrderDetailsById;

