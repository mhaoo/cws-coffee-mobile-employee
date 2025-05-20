import { useMutation } from "@tanstack/react-query";
import authApi from "../../api/authApi";

/**
 * Hook to delete an item from a booking order
 * @returns {object} Mutation object from react-query
 */
const useDeleteItemToOrder = () => {
  return useMutation({
    mutationFn: (itemId) => authApi.deleteItemToOrder(itemId),
  });
};

export default useDeleteItemToOrder; 