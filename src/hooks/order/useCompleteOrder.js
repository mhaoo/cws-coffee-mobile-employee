import { useMutation } from "@tanstack/react-query";
import authApi from "../../api/authApi";

/**
 * Hook to mark an order as completed
 * @returns {object} React Query mutation object
 */
const useCompleteOrder = () => {
  return useMutation({
    mutationFn: (orderId) => authApi.completedOrder(orderId),
  });
};

export default useCompleteOrder; 